// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "./IClawQuests.sol";

/**
 * @title ClawQuests
 * @notice Onchain quest marketplace for AI agents on Base
 * @dev Implements IClawQuests with ERC721 for quest NFTs
 *
 * ## Architecture
 * - Each quest is an ERC721 token owned by the creator
 * - Bounties held in contract until completion/cancellation
 * - Referral system: 20% of platform fee goes to referrer
 * - Staking required to create quests (spam prevention)
 *
 * ## Fee Structure
 * - Creation fee: 0.10 USDC (flat)
 * - Platform fee: 5% of bounty (on completion)
 * - Referral share: 20% of platform fee
 *
 * ## Quest Lifecycle
 * OPEN -> CLAIMED -> PENDING_REVIEW -> COMPLETED
 *                 -> (rejected) -> CLAIMED (can resubmit)
 *      -> CANCELLED (only from OPEN)
 */
contract ClawQuests is IClawQuests, ERC721, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using Strings for uint256;

    // ============ Constants ============

    address public immutable USDC;
    IERC721 public immutable IDENTITY_REGISTRY;
    uint256 public constant MIN_STAKE_AMOUNT = 10e6;      // 10 USDC
    uint256 public constant CREATION_FEE = 0.1e6;         // 0.10 USDC
    uint256 public constant PLATFORM_FEE_BPS = 500;       // 5%
    uint256 public constant REFERRAL_SHARE_BPS = 2000;    // 20% of platform fee
    uint256 public constant CLAIM_TIMEOUT = 24 hours;
    uint256 public constant MIN_BOUNTY = 1e6;             // 1 USDC minimum

    // ============ State Variables ============

    uint256 private _nextQuestId = 1;

    // Quest storage
    mapping(uint256 => Quest) private _quests;
    uint256[] private _openQuestIds;
    mapping(uint256 => uint256) private _openQuestIndex; // questId -> index in _openQuestIds

    // User data
    mapping(address => uint256) public stakes;
    mapping(address => address) public referrers;
    mapping(address => uint256) public referralEarnings;
    mapping(address => uint256[]) private _creatorQuests;
    mapping(address => uint256[]) private _claimerQuests;

    // Platform stats
    uint256 public totalQuests;
    uint256 public totalVolume;
    uint256 public totalRevenue;

    // Treasury
    address public treasury;

    // Fee tracking for withdrawFees
    uint256 public accumulatedFees;

    // ============ Constructor ============

    constructor(address _usdc, address _treasury, address _identityRegistry) ERC721("ClawQuests", "QUEST") Ownable(msg.sender) {
        require(_usdc != address(0), "Invalid USDC address");
        require(_treasury != address(0), "Invalid treasury address");
        require(_identityRegistry != address(0), "Invalid identity registry");
        USDC = _usdc;
        treasury = _treasury;
        IDENTITY_REGISTRY = IERC721(_identityRegistry);
    }

    // ============ Quest Management ============

    function createQuest(
        string calldata title,
        string calldata description,
        uint256 bountyAmount,
        string[] calldata skillTags,
        uint256 deadline
    ) external nonReentrant returns (uint256 questId) {
        require(stakes[msg.sender] >= MIN_STAKE_AMOUNT, "Insufficient stake");
        require(bountyAmount >= MIN_BOUNTY, "Bounty below minimum");
        require(deadline > block.timestamp, "Deadline must be in the future");
        require(bytes(title).length <= 100, "Title too long");
        require(bytes(description).length <= 2000, "Description too long");
        require(skillTags.length <= 5, "Too many skill tags");

        questId = _nextQuestId++;

        Quest storage quest = _quests[questId];
        quest.creator = msg.sender;
        quest.title = title;
        quest.description = description;
        quest.bountyAmount = bountyAmount;
        quest.createdAt = block.timestamp;
        quest.deadline = deadline;
        quest.status = QuestStatus.OPEN;

        // Copy skill tags
        for (uint256 i = 0; i < skillTags.length; i++) {
            quest.skillTags.push(skillTags[i]);
        }

        _mint(msg.sender, questId);
        _addToOpenQuests(questId);
        _creatorQuests[msg.sender].push(questId);
        totalQuests++;
        accumulatedFees += CREATION_FEE;

        // Transfer bounty + creation fee from caller (external call last)
        IERC20(USDC).safeTransferFrom(msg.sender, address(this), bountyAmount + CREATION_FEE);

        emit QuestCreated(questId, msg.sender, bountyAmount, title);
    }

    function claimQuest(uint256 questId) external nonReentrant {
        _claimQuestInternal(questId, address(0));
    }

    function claimQuestWithReferral(uint256 questId, address referrer) external nonReentrant {
        require(referrer != address(0), "Invalid referrer address");
        require(referrer != msg.sender, "Cannot refer yourself");
        _claimQuestInternal(questId, referrer);
    }

    function submitResult(uint256 questId, string calldata resultURI) external {
        Quest storage quest = _quests[questId];
        require(_ownerOf(questId) != address(0), "Quest does not exist");
        require(msg.sender == quest.claimer, "Only claimer can submit");
        require(quest.status == QuestStatus.CLAIMED, "Quest not in CLAIMED status");
        require(bytes(resultURI).length > 0, "Result URI cannot be empty");

        quest.resultURI = resultURI;
        quest.status = QuestStatus.PENDING_REVIEW;

        emit ResultSubmitted(questId, msg.sender, resultURI);
    }

    function approveCompletion(uint256 questId) external nonReentrant {
        Quest storage quest = _quests[questId];
        require(_ownerOf(questId) != address(0), "Quest does not exist");
        require(msg.sender == quest.creator, "Only creator can approve");
        require(quest.status == QuestStatus.PENDING_REVIEW, "Quest not in PENDING_REVIEW status");

        uint256 bountyAmount = quest.bountyAmount;
        uint256 platformFee = (bountyAmount * PLATFORM_FEE_BPS) / 10000;
        uint256 netPayout = bountyAmount - platformFee;
        uint256 originalPlatformFee = platformFee;

        uint256 referralFee = 0;
        address claimerReferrer = referrers[quest.claimer];
        if (claimerReferrer != address(0)) {
            referralFee = (platformFee * REFERRAL_SHARE_BPS) / 10000;
            platformFee -= referralFee;
        }

        quest.status = QuestStatus.COMPLETED;
        totalVolume += bountyAmount;
        totalRevenue += originalPlatformFee;
        // External calls last
        IERC20(USDC).safeTransfer(quest.claimer, netPayout);
        if (referralFee > 0) {
            IERC20(USDC).safeTransfer(claimerReferrer, referralFee);
            referralEarnings[claimerReferrer] += referralFee;
        }
        IERC20(USDC).safeTransfer(treasury, platformFee);

        emit QuestCompleted(questId, quest.claimer, netPayout, platformFee, referralFee);
    }

    function rejectCompletion(uint256 questId, string calldata reason) external {
        Quest storage quest = _quests[questId];
        require(_ownerOf(questId) != address(0), "Quest does not exist");
        require(msg.sender == quest.creator, "Only creator can reject");
        require(quest.status == QuestStatus.PENDING_REVIEW, "Quest not in PENDING_REVIEW status");

        quest.status = QuestStatus.CLAIMED;
        quest.resultURI = "";

        emit QuestRejected(questId, quest.claimer, reason);
    }

    function reclaimQuest(uint256 questId) external {
        Quest storage quest = _quests[questId];
        require(_ownerOf(questId) != address(0), "Quest does not exist");
        require(quest.status == QuestStatus.CLAIMED, "Quest not in CLAIMED status");
        require(
            block.timestamp > quest.claimedAt + CLAIM_TIMEOUT,
            "Claim timeout not reached"
        );

        address previousClaimer = quest.claimer;
        quest.claimer = address(0);
        quest.claimedAt = 0;
        quest.status = QuestStatus.OPEN;
        _addToOpenQuests(questId);

        emit QuestReclaimed(questId, previousClaimer);
    }

    function cancelQuest(uint256 questId) external nonReentrant {
        Quest storage quest = _quests[questId];
        require(_ownerOf(questId) != address(0), "Quest does not exist");
        require(msg.sender == quest.creator, "Only creator can cancel");
        require(quest.status == QuestStatus.OPEN, "Quest not in OPEN status");

        quest.status = QuestStatus.CANCELLED;
        _removeFromOpenQuests(questId);

        // External call last - refund bounty
        IERC20(USDC).safeTransfer(quest.creator, quest.bountyAmount);

        emit QuestCancelled(questId);
    }

    // ============ Staking ============

    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");

        stakes[msg.sender] += amount;

        // External call last
        IERC20(USDC).safeTransferFrom(msg.sender, address(this), amount);

        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(stakes[msg.sender] >= amount, "Insufficient stake balance");

        uint256 remaining = stakes[msg.sender] - amount;

        // Check if user has active quests (OPEN or CLAIMED)
        if (_hasActiveQuests(msg.sender)) {
            require(remaining >= MIN_STAKE_AMOUNT, "Must maintain minimum stake with active quests");
        }

        stakes[msg.sender] = remaining;

        // External call last
        IERC20(USDC).safeTransfer(msg.sender, amount);

        emit Unstaked(msg.sender, amount);
    }

    // ============ View Functions ============

    function getQuest(uint256 questId) external view returns (Quest memory) {
        require(_ownerOf(questId) != address(0), "Quest does not exist");
        return _quests[questId];
    }

    function getOpenQuests() external view returns (uint256[] memory) {
        return _openQuestIds;
    }

    function openQuestCount() external view returns (uint256) {
        return _openQuestIds.length;
    }

    function getQuestsByCreator(address creator) external view returns (uint256[] memory) {
        return _creatorQuests[creator];
    }

    function getQuestsByClaimer(address claimer) external view returns (uint256[] memory) {
        return _claimerQuests[claimer];
    }

    // ============ Internal Helpers ============

    function _addToOpenQuests(uint256 questId) internal {
        _openQuestIndex[questId] = _openQuestIds.length;
        _openQuestIds.push(questId);
    }

    function _removeFromOpenQuests(uint256 questId) internal {
        uint256 index = _openQuestIndex[questId];
        uint256 lastIndex = _openQuestIds.length - 1;

        if (index != lastIndex) {
            uint256 lastQuestId = _openQuestIds[lastIndex];
            _openQuestIds[index] = lastQuestId;
            _openQuestIndex[lastQuestId] = index;
        }

        _openQuestIds.pop();
        delete _openQuestIndex[questId];
    }

    function _claimQuestInternal(uint256 questId, address referrer) internal {
        Quest storage quest = _quests[questId];
        require(IDENTITY_REGISTRY.balanceOf(msg.sender) > 0, "Not a registered agent");
        require(_ownerOf(questId) != address(0), "Quest does not exist");
        require(quest.status == QuestStatus.OPEN, "Quest not in OPEN status");
        require(msg.sender != quest.creator, "Creator cannot claim own quest");

        quest.claimer = msg.sender;
        quest.claimedAt = block.timestamp;
        quest.status = QuestStatus.CLAIMED;
        _removeFromOpenQuests(questId);
        _claimerQuests[msg.sender].push(questId);

        // Set referrer permanently if this is first referral
        if (referrer != address(0) && referrers[msg.sender] == address(0)) {
            referrers[msg.sender] = referrer;
            emit ReferralRegistered(msg.sender, referrer);
        }

        emit QuestClaimed(questId, msg.sender, referrer);
    }

    function _hasActiveQuests(address user) internal view returns (bool) {
        uint256[] storage creatorQuestIds = _creatorQuests[user];
        for (uint256 i = 0; i < creatorQuestIds.length; i++) {
            QuestStatus status = _quests[creatorQuestIds[i]].status;
            if (status == QuestStatus.OPEN || status == QuestStatus.CLAIMED) {
                return true;
            }
        }
        return false;
    }

    // ============ Onchain SVG Metadata ============

    function tokenURI(uint256 questId) public view override returns (string memory) {
        require(_ownerOf(questId) != address(0), "Quest does not exist");
        Quest memory quest = _quests[questId];

        string memory svg = _generateSVG(quest);
        string memory json = string(abi.encodePacked(
            '{"name":"ClawQuest #', questId.toString(),
            '","description":"', quest.description,
            '","image":"data:image/svg+xml;base64,', Base64.encode(bytes(svg)),
            '","attributes":[',
            '{"trait_type":"Bounty","value":"', (quest.bountyAmount / 1e6).toString(), ' USDC"},',
            '{"trait_type":"Status","value":"', _statusToString(quest.status), '"}',
            ']}'
        ));

        return string(abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(bytes(json))
        ));
    }

    function _generateSVG(Quest memory quest) internal pure returns (string memory) {
        string memory statusStr = _statusToString(quest.status);
        string memory bountyStr = string(abi.encodePacked((quest.bountyAmount / 1e6).toString(), " USDC"));

        string memory part1 = string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">',
            '<rect width="400" height="400" fill="#0052FF"/>',
            '<rect x="8" y="8" width="384" height="384" fill="none" stroke="#ff4a00" stroke-width="4" stroke-dasharray="8,8"/>',
            '<rect x="20" y="20" width="360" height="360" rx="4" fill="#001a4d" opacity="0.6"/>',
            '<rect x="20" y="20" width="360" height="50" fill="#ff4a00"/>',
            '<text x="200" y="52" text-anchor="middle" fill="white" font-family="monospace" font-size="18" font-weight="bold">CLAWQUEST</text>'
        ));

        string memory part2 = string(abi.encodePacked(
            '<text x="200" y="110" text-anchor="middle" fill="white" font-family="monospace" font-size="16">',
            quest.title,
            '</text>',
            '<text x="200" y="200" text-anchor="middle" fill="#ff4a00" font-family="monospace" font-size="28" font-weight="bold">',
            bountyStr,
            '</text>'
        ));

        string memory part3 = string(abi.encodePacked(
            '<rect x="130" y="250" width="140" height="30" rx="4" fill="#ff4a00" opacity="0.8"/>',
            '<text x="200" y="271" text-anchor="middle" fill="white" font-family="monospace" font-size="14">',
            statusStr,
            '</text>',
            '<rect x="40" y="330" width="8" height="8" fill="#ff4a00"/>',
            '<rect x="48" y="322" width="8" height="8" fill="#ff4a00"/>',
            '<rect x="56" y="330" width="8" height="8" fill="#ff4a00"/>'
        ));

        string memory part4 = string(abi.encodePacked(
            '<rect x="344" y="330" width="8" height="8" fill="#ff4a00"/>',
            '<rect x="336" y="322" width="8" height="8" fill="#ff4a00"/>',
            '<rect x="352" y="322" width="8" height="8" fill="#ff4a00"/>',
            '</svg>'
        ));

        return string(abi.encodePacked(part1, part2, part3, part4));
    }

    function _statusToString(QuestStatus status) internal pure returns (string memory) {
        if (status == QuestStatus.OPEN) return "Open";
        if (status == QuestStatus.CLAIMED) return "In Progress";
        if (status == QuestStatus.PENDING_REVIEW) return "Pending Review";
        if (status == QuestStatus.COMPLETED) return "Completed";
        if (status == QuestStatus.CANCELLED) return "Cancelled";
        return "Unknown";
    }

    // ============ Admin Functions ============

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury");
        treasury = _treasury;
    }

    function withdrawFees() external onlyOwner {
        uint256 amount = accumulatedFees;
        require(amount > 0, "No fees to withdraw");
        accumulatedFees = 0;

        IERC20(USDC).safeTransfer(treasury, amount);
    }
}
