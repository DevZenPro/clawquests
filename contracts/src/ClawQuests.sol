// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
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

    // ============ Constructor ============

    constructor(address _usdc, address _treasury) ERC721("ClawQuests", "QUEST") Ownable(msg.sender) {
        require(_usdc != address(0), "Invalid USDC address");
        require(_treasury != address(0), "Invalid treasury address");
        USDC = _usdc;
        treasury = _treasury;
    }

    // ============ Quest Management ============

    function createQuest(
        string calldata title,
        string calldata description,
        uint256 bountyAmount,
        string[] calldata skillTags,
        uint256 deadline
    ) external nonReentrant returns (uint256 questId) {
        // TODO: Implement
        // 1. Validate inputs (stake, bounty, deadline, lengths)
        // 2. Transfer bounty + creation fee from caller
        // 3. Create quest struct
        // 4. Mint NFT to creator
        // 5. Add to open quests
        // 6. Emit event
    }

    function claimQuest(uint256 questId) external nonReentrant {
        // TODO: Implement
    }

    function claimQuestWithReferral(uint256 questId, address referrer) external nonReentrant {
        // TODO: Implement
    }

    function submitResult(uint256 questId, string calldata resultURI) external {
        // TODO: Implement
    }

    function approveCompletion(uint256 questId) external nonReentrant {
        // TODO: Implement
        // 1. Validate caller is creator, status is PENDING_REVIEW
        // 2. Calculate fees
        // 3. Transfer payout to claimer
        // 4. Handle referral fee if applicable
        // 5. Transfer platform fee to treasury
        // 6. Update stats
        // 7. Emit event
    }

    function rejectCompletion(uint256 questId, string calldata reason) external {
        // TODO: Implement
    }

    function reclaimQuest(uint256 questId) external {
        // TODO: Implement
    }

    function cancelQuest(uint256 questId) external nonReentrant {
        // TODO: Implement
    }

    // ============ Staking ============

    function stake(uint256 amount) external nonReentrant {
        // TODO: Implement
    }

    function unstake(uint256 amount) external nonReentrant {
        // TODO: Implement
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
        // TODO: Implement shared claim logic
    }

    // ============ Onchain SVG Metadata ============

    function tokenURI(uint256 questId) public view override returns (string memory) {
        require(_ownerOf(questId) != address(0), "Quest does not exist");
        Quest memory quest = _quests[questId];
        
        // TODO: Generate onchain SVG
        // Should include: title, bounty, status, skill tags
        
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
        // TODO: Implement pixel-art style SVG generation
        // Theme: "Pixel-Lobster-Base" 
        // Colors: Base blue (#0052FF), Lobster orange-red (#ff4a00)
        return string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">',
            '<rect width="400" height="400" fill="#0052FF"/>',
            '<text x="200" y="200" text-anchor="middle" fill="white" font-size="24">',
            quest.title,
            '</text>',
            '</svg>'
        ));
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
        uint256 balance = IERC20(USDC).balanceOf(address(this));
        // Only withdraw accumulated fees, not bounties
        // TODO: Track fee balance separately
    }
}
