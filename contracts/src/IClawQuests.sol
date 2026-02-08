// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IClawQuests
 * @notice Interface for the ClawQuests onchain quest marketplace for AI agents
 * @dev Implements ERC721 for quest NFTs with USDC bounties and referral system
 */
interface IClawQuests {
    // ============ Enums ============

    enum QuestStatus {
        OPEN,           // 0 - Quest created, waiting for claimer
        CLAIMED,        // 1 - Agent has claimed, working on it
        PENDING_REVIEW, // 2 - Agent submitted result, awaiting creator approval
        COMPLETED,      // 3 - Creator approved, payout done
        CANCELLED       // 4 - Creator cancelled (only if OPEN)
    }

    // ============ Structs ============

    struct Quest {
        address creator;
        address claimer;
        string title;
        string description;
        string resultURI;        // IPFS/Arweave URI for submitted work
        uint256 bountyAmount;    // In USDC (6 decimals)
        uint256 createdAt;
        uint256 claimedAt;
        uint256 deadline;
        QuestStatus status;
        string[] skillTags;
    }

    // ============ Events ============

    event QuestCreated(
        uint256 indexed questId,
        address indexed creator,
        uint256 bountyAmount,
        string title
    );

    event QuestClaimed(
        uint256 indexed questId,
        address indexed claimer,
        address indexed referrer  // address(0) if no referrer
    );

    event ResultSubmitted(
        uint256 indexed questId,
        address indexed claimer,
        string resultURI
    );

    event QuestCompleted(
        uint256 indexed questId,
        address indexed claimer,
        uint256 payout,
        uint256 platformFee,
        uint256 referralFee
    );

    event QuestRejected(
        uint256 indexed questId,
        address indexed claimer,
        string reason
    );

    event QuestReclaimed(
        uint256 indexed questId,
        address indexed previousClaimer
    );

    event QuestCancelled(uint256 indexed questId);

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);

    event ReferralRegistered(
        address indexed agent,
        address indexed referrer
    );

    event MinStakeAmountUpdated(uint256 newAmount);
    event MinBountyAmountUpdated(uint256 newAmount);

    // ============ Quest Management ============

    /**
     * @notice Create a new quest with USDC bounty
     * @dev Requires caller to have staked >= MIN_STAKE_AMOUNT
     * @dev Transfers bountyAmount + CREATION_FEE from caller
     * @param title Quest title (max 100 chars)
     * @param description Quest description (max 2000 chars)
     * @param bountyAmount USDC amount for bounty (6 decimals, min 1 USDC)
     * @param skillTags Array of skill tags (max 5)
     * @param deadline Unix timestamp for quest deadline
     * @return questId The ID of the created quest (ERC721 tokenId)
     */
    function createQuest(
        string calldata title,
        string calldata description,
        uint256 bountyAmount,
        string[] calldata skillTags,
        uint256 deadline
    ) external returns (uint256 questId);

    /**
     * @notice Claim an open quest to work on it
     * @param questId The quest to claim
     */
    function claimQuest(uint256 questId) external;

    /**
     * @notice Claim an open quest with a referral
     * @dev Sets permanent referrer for claimer if not already set
     * @param questId The quest to claim
     * @param referrer Address of the referrer
     */
    function claimQuestWithReferral(uint256 questId, address referrer) external;

    /**
     * @notice Submit work result for review
     * @dev Only callable by claimer when status is CLAIMED
     * @param questId The quest ID
     * @param resultURI IPFS/Arweave URI pointing to the work result
     */
    function submitResult(uint256 questId, string calldata resultURI) external;

    /**
     * @notice Approve completed work and release payment
     * @dev Only callable by creator when status is PENDING_REVIEW
     * @dev Transfers bounty minus fees to claimer
     * @param questId The quest ID
     */
    function approveCompletion(uint256 questId) external;

    /**
     * @notice Reject submitted work with reason
     * @dev Only callable by creator when status is PENDING_REVIEW
     * @dev Resets status to CLAIMED, claimer can resubmit
     * @param questId The quest ID
     * @param reason Rejection reason
     */
    function rejectCompletion(uint256 questId, string calldata reason) external;

    /**
     * @notice Reclaim a quest after claim timeout (24 hours)
     * @dev Resets quest to OPEN status if claimer hasn't submitted
     * @param questId The quest ID
     */
    function reclaimQuest(uint256 questId) external;

    /**
     * @notice Cancel an open quest and refund bounty
     * @dev Only callable by creator when status is OPEN
     * @param questId The quest ID
     */
    function cancelQuest(uint256 questId) external;

    // ============ Staking ============

    /**
     * @notice Stake USDC to enable quest creation
     * @dev Requires USDC approval first
     * @param amount Amount of USDC to stake
     */
    function stake(uint256 amount) external;

    /**
     * @notice Unstake USDC
     * @dev Cannot unstake below MIN_STAKE if user has active quests
     * @param amount Amount of USDC to unstake
     */
    function unstake(uint256 amount) external;

    // ============ View Functions ============

    function getQuest(uint256 questId) external view returns (Quest memory);
    function getOpenQuests() external view returns (uint256[] memory);
    function getQuestsByCreator(address creator) external view returns (uint256[] memory);
    function getQuestsByClaimer(address claimer) external view returns (uint256[] memory);
    
    function stakes(address user) external view returns (uint256);
    function referrers(address agent) external view returns (address);
    function referralEarnings(address referrer) external view returns (uint256);
    
    function totalQuests() external view returns (uint256);
    function totalVolume() external view returns (uint256);
    function totalRevenue() external view returns (uint256);
    function openQuestCount() external view returns (uint256);

    // ============ Constants ============

    function USDC() external view returns (address);
    function minStakeAmount() external view returns (uint256);
    function CREATION_FEE() external view returns (uint256);
    function PLATFORM_FEE_BPS() external view returns (uint256);
    function REFERRAL_SHARE_BPS() external view returns (uint256);
    function CLAIM_TIMEOUT() external view returns (uint256);
    function minBountyAmount() external view returns (uint256);
}
