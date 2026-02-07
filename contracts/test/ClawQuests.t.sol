// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/ClawQuests.sol";
import "../src/IClawQuests.sol";

/**
 * @title ClawQuestsTest
 * @notice Comprehensive test suite for ClawQuests contract
 * 
 * ## Test Categories
 * 1. Deployment & Setup
 * 2. Staking (stake, unstake, validations)
 * 3. Quest Creation (happy path, edge cases, validations)
 * 4. Quest Claiming (with/without referral)
 * 5. Result Submission
 * 6. Approval Flow (payout calculations, fee distribution)
 * 7. Rejection Flow
 * 8. Reclaim Flow (timeout mechanics)
 * 9. Cancellation
 * 10. View Functions
 * 11. Edge Cases & Security
 */
contract ClawQuestsTest is Test {
    ClawQuests public quests;
    MockERC20 public usdc;
    
    address public treasury = address(0x1);
    address public creator = address(0x2);
    address public agent1 = address(0x3);
    address public agent2 = address(0x4);
    address public referrer = address(0x5);
    
    uint256 constant USDC_DECIMALS = 6;
    uint256 constant ONE_USDC = 1e6;
    uint256 constant TEN_USDC = 10e6;
    uint256 constant HUNDRED_USDC = 100e6;

    function setUp() public {
        // Deploy mock USDC
        usdc = new MockERC20("USD Coin", "USDC", 6);
        
        // Deploy ClawQuests
        quests = new ClawQuests(address(usdc), treasury);
        
        // Fund test accounts
        usdc.mint(creator, 1000 * ONE_USDC);
        usdc.mint(agent1, 100 * ONE_USDC);
        usdc.mint(agent2, 100 * ONE_USDC);
        usdc.mint(referrer, 100 * ONE_USDC);
        
        // Approve contract
        vm.prank(creator);
        usdc.approve(address(quests), type(uint256).max);
        vm.prank(agent1);
        usdc.approve(address(quests), type(uint256).max);
        vm.prank(agent2);
        usdc.approve(address(quests), type(uint256).max);
    }

    // ============ Deployment Tests ============

    function test_Deployment() public view {
        assertEq(quests.USDC(), address(usdc));
        assertEq(quests.treasury(), treasury);
        assertEq(quests.MIN_STAKE_AMOUNT(), TEN_USDC);
        assertEq(quests.PLATFORM_FEE_BPS(), 500);
    }

    // ============ Staking Tests ============

    function test_Stake() public {
        // TODO: Implement
    }

    function test_Unstake() public {
        // TODO: Implement
    }

    function test_RevertWhen_UnstakeBelowMinWithActiveQuests() public {
        // TODO: Implement
    }

    // ============ Quest Creation Tests ============

    function test_CreateQuest() public {
        // TODO: Implement
    }

    function test_RevertWhen_CreateQuestWithoutStake() public {
        // TODO: Implement
    }

    function test_RevertWhen_BountyBelowMinimum() public {
        // TODO: Implement
    }

    function test_RevertWhen_DeadlineInPast() public {
        // TODO: Implement
    }

    // ============ Quest Claiming Tests ============

    function test_ClaimQuest() public {
        // TODO: Implement
    }

    function test_ClaimQuestWithReferral() public {
        // TODO: Implement
    }

    function test_ReferralPersistence() public {
        // TODO: Referrer should be set permanently on first claim with referral
    }

    function test_RevertWhen_ClaimNonOpenQuest() public {
        // TODO: Implement
    }

    // ============ Result Submission Tests ============

    function test_SubmitResult() public {
        // TODO: Implement
    }

    function test_RevertWhen_NonClaimerSubmits() public {
        // TODO: Implement
    }

    // ============ Approval Tests ============

    function test_ApproveCompletion() public {
        // TODO: Implement full flow with fee verification
    }

    function test_ApproveCompletion_WithReferral() public {
        // TODO: Verify referral fee distribution
    }

    function test_FeeCalculation() public {
        // TODO: Verify exact fee math
        // 100 USDC bounty:
        // - Platform fee: 5 USDC (5%)
        // - Net payout: 95 USDC
        // - Referral share: 1 USDC (20% of 5 USDC)
        // - Treasury receives: 4 USDC
    }

    // ============ Rejection Tests ============

    function test_RejectCompletion() public {
        // TODO: Verify status reset to CLAIMED
    }

    function test_ResubmitAfterRejection() public {
        // TODO: Claimer should be able to submit again
    }

    // ============ Reclaim Tests ============

    function test_ReclaimAfterTimeout() public {
        // TODO: Fast-forward 24h and reclaim
    }

    function test_RevertWhen_ReclaimBeforeTimeout() public {
        // TODO: Should revert if < 24h
    }

    function test_RevertWhen_ReclaimAfterSubmission() public {
        // TODO: Cannot reclaim if claimer submitted work
    }

    // ============ Cancellation Tests ============

    function test_CancelQuest() public {
        // TODO: Creator cancels, gets bounty back
    }

    function test_RevertWhen_CancelClaimedQuest() public {
        // TODO: Cannot cancel if already claimed
    }

    // ============ View Function Tests ============

    function test_GetOpenQuests() public {
        // TODO: Implement
    }

    function test_GetQuestsByCreator() public {
        // TODO: Implement
    }

    // ============ NFT Metadata Tests ============

    function test_TokenURI() public {
        // TODO: Verify onchain SVG generation
    }

    // ============ Edge Cases ============

    function test_MultipleQuestsFromSameCreator() public {
        // TODO: Implement
    }

    function test_SameAgentClaimsMultipleQuests() public {
        // TODO: Implement
    }

    // ============ Helper Functions ============

    function _createQuestWithStake() internal returns (uint256) {
        vm.startPrank(creator);
        quests.stake(TEN_USDC);
        
        string[] memory tags = new string[](2);
        tags[0] = "solidity";
        tags[1] = "defi";
        
        uint256 questId = quests.createQuest(
            "Test Quest",
            "A test quest description",
            HUNDRED_USDC,
            tags,
            block.timestamp + 7 days
        );
        vm.stopPrank();
        return questId;
    }
}

// ============ Mock USDC ============

contract MockERC20 {
    string public name;
    string public symbol;
    uint8 public decimals;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    constructor(string memory _name, string memory _symbol, uint8 _decimals) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
    }
    
    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }
    
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }
    
    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}
