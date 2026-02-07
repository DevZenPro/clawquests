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
    MockERC721 public identityRegistry;
    
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
        // Deploy mocks
        usdc = new MockERC20("USD Coin", "USDC", 6);
        identityRegistry = new MockERC721("Mock Identity", "MID");
        
        // Deploy ClawQuests
        quests = new ClawQuests(address(usdc), treasury, address(identityRegistry));
        
        // Mint identities for agents and referrer
        identityRegistry.mint(agent1, 1);
        identityRegistry.mint(agent2, 2);
        identityRegistry.mint(referrer, 3);
        
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
        uint256 balBefore = usdc.balanceOf(creator);
        uint256 contractBalBefore = usdc.balanceOf(address(quests));

        vm.expectEmit(true, false, false, true);
        emit IClawQuests.Staked(creator, TEN_USDC);

        vm.prank(creator);
        quests.stake(TEN_USDC);

        assertEq(quests.stakes(creator), TEN_USDC, "stakes mapping not updated");
        assertEq(usdc.balanceOf(creator), balBefore - TEN_USDC, "creator balance not reduced");
        assertEq(usdc.balanceOf(address(quests)), contractBalBefore + TEN_USDC, "contract balance not increased");
    }

    function test_Unstake() public {
        vm.prank(creator);
        quests.stake(TEN_USDC);

        uint256 balBefore = usdc.balanceOf(creator);

        vm.expectEmit(true, false, false, true);
        emit IClawQuests.Unstaked(creator, TEN_USDC);

        vm.prank(creator);
        quests.unstake(TEN_USDC);

        assertEq(quests.stakes(creator), 0, "stakes not zeroed");
        assertEq(usdc.balanceOf(creator), balBefore + TEN_USDC, "creator balance not restored");
    }

    function test_RevertWhen_UnstakeBelowMinWithActiveQuests() public {
        // Stake 20 USDC and create a quest (which requires MIN_STAKE)
        vm.startPrank(creator);
        quests.stake(20 * ONE_USDC);

        string[] memory tags = new string[](1);
        tags[0] = "test";
        quests.createQuest("Test", "Desc", HUNDRED_USDC, tags, block.timestamp + 7 days);

        // Try to unstake so remaining < MIN_STAKE (unstake 15, leaving 5)
        vm.expectRevert();
        quests.unstake(15 * ONE_USDC);
        vm.stopPrank();
    }

    // ============ Quest Creation Tests ============

    function test_CreateQuest() public {
        vm.startPrank(creator);
        quests.stake(TEN_USDC);

        string[] memory tags = new string[](2);
        tags[0] = "solidity";
        tags[1] = "defi";

        uint256 balBefore = usdc.balanceOf(creator);
        uint256 creationFee = quests.CREATION_FEE();

        vm.expectEmit(true, true, false, true);
        emit IClawQuests.QuestCreated(1, creator, HUNDRED_USDC, "Test Quest");

        uint256 questId = quests.createQuest(
            "Test Quest",
            "A test quest description",
            HUNDRED_USDC,
            tags,
            block.timestamp + 7 days
        );
        vm.stopPrank();

        assertEq(questId, 1, "questId should be 1");
        assertEq(quests.totalQuests(), 1, "totalQuests not incremented");

        // Verify USDC transfer: bounty + creation fee
        assertEq(usdc.balanceOf(creator), balBefore - HUNDRED_USDC - creationFee, "incorrect creator balance");

        // Verify quest struct
        IClawQuests.Quest memory q = quests.getQuest(questId);
        assertEq(q.creator, creator);
        assertEq(q.bountyAmount, HUNDRED_USDC);
        assertEq(q.title, "Test Quest");
        assertEq(q.description, "A test quest description");
        assertEq(uint256(q.status), uint256(IClawQuests.QuestStatus.OPEN));
        assertEq(q.deadline, block.timestamp + 7 days);
        assertEq(q.skillTags.length, 2);
        assertEq(q.skillTags[0], "solidity");
        assertEq(q.skillTags[1], "defi");

        // Verify NFT minted to creator
        assertEq(quests.ownerOf(questId), creator);

        // Verify open quests tracking
        uint256[] memory openQuests = quests.getOpenQuests();
        assertEq(openQuests.length, 1);
        assertEq(openQuests[0], questId);

        // Verify creator quests tracking
        uint256[] memory creatorQuests = quests.getQuestsByCreator(creator);
        assertEq(creatorQuests.length, 1);
        assertEq(creatorQuests[0], questId);
    }

    function test_RevertWhen_CreateQuestWithoutStake() public {
        string[] memory tags = new string[](1);
        tags[0] = "test";

        vm.prank(creator);
        vm.expectRevert();
        quests.createQuest("Test", "Desc", HUNDRED_USDC, tags, block.timestamp + 7 days);
    }

    function test_RevertWhen_BountyBelowMinimum() public {
        vm.startPrank(creator);
        quests.stake(TEN_USDC);

        string[] memory tags = new string[](1);
        tags[0] = "test";

        // 0.5 USDC is below MIN_BOUNTY of 1 USDC
        vm.expectRevert();
        quests.createQuest("Test", "Desc", 0.5e6, tags, block.timestamp + 7 days);
        vm.stopPrank();
    }

    function test_RevertWhen_DeadlineInPast() public {
        vm.startPrank(creator);
        quests.stake(TEN_USDC);

        string[] memory tags = new string[](1);
        tags[0] = "test";

        vm.expectRevert();
        quests.createQuest("Test", "Desc", HUNDRED_USDC, tags, block.timestamp - 1);
        vm.stopPrank();
    }

    // ============ Quest Claiming Tests ============

    function test_ClaimQuest() public {
        uint256 questId = _createQuestWithStake();

        vm.expectEmit(true, true, true, true);
        emit IClawQuests.QuestClaimed(questId, agent1, address(0));

        vm.prank(agent1);
        quests.claimQuest(questId);

        IClawQuests.Quest memory q = quests.getQuest(questId);
        assertEq(q.claimer, agent1, "claimer not set");
        assertEq(uint256(q.status), uint256(IClawQuests.QuestStatus.CLAIMED), "status not CLAIMED");
        assertTrue(q.claimedAt > 0, "claimedAt not set");

        // Verify removed from open quests
        uint256[] memory openQuests = quests.getOpenQuests();
        assertEq(openQuests.length, 0, "quest not removed from open quests");

        // Verify claimer quests tracking
        uint256[] memory claimerQuests = quests.getQuestsByClaimer(agent1);
        assertEq(claimerQuests.length, 1);
        assertEq(claimerQuests[0], questId);
    }

    function test_ClaimQuestWithReferral() public {
        uint256 questId = _createQuestWithStake();

        vm.expectEmit(true, true, false, true);
        emit IClawQuests.ReferralRegistered(agent1, referrer);

        vm.expectEmit(true, true, true, true);
        emit IClawQuests.QuestClaimed(questId, agent1, referrer);

        vm.prank(agent1);
        quests.claimQuestWithReferral(questId, referrer);

        assertEq(quests.referrers(agent1), referrer, "referrer not set");

        IClawQuests.Quest memory q = quests.getQuest(questId);
        assertEq(q.claimer, agent1);
        assertEq(uint256(q.status), uint256(IClawQuests.QuestStatus.CLAIMED));
    }

    function test_ReferralPersistence() public {
        // Create two quests
        uint256 questId1 = _createQuestWithStake();

        // Create a second quest
        vm.startPrank(creator);
        string[] memory tags = new string[](1);
        tags[0] = "test";
        uint256 questId2 = quests.createQuest("Quest 2", "Desc 2", HUNDRED_USDC, tags, block.timestamp + 7 days);
        vm.stopPrank();

        // Claim first quest with referrer
        vm.prank(agent1);
        quests.claimQuestWithReferral(questId1, referrer);
        assertEq(quests.referrers(agent1), referrer, "referrer not set initially");

        // Claim second quest with a different referrer address - should NOT change
        vm.prank(agent1);
        quests.claimQuestWithReferral(questId2, agent2);
        assertEq(quests.referrers(agent1), referrer, "referrer changed - should be permanent");
    }

    function test_RevertWhen_ClaimNonOpenQuest() public {
        uint256 questId = _createQuestWithStake();

        // agent1 claims the quest first
        vm.prank(agent1);
        quests.claimQuest(questId);

        // agent2 tries to claim the same (now CLAIMED) quest
        vm.prank(agent2);
        vm.expectRevert();
        quests.claimQuest(questId);
    }

    // ============ Result Submission Tests ============

    function test_SubmitResult() public {
        uint256 questId = _createQuestWithStake();

        vm.prank(agent1);
        quests.claimQuest(questId);

        vm.expectEmit(true, true, false, true);
        emit IClawQuests.ResultSubmitted(questId, agent1, "ipfs://result123");

        vm.prank(agent1);
        quests.submitResult(questId, "ipfs://result123");

        IClawQuests.Quest memory q = quests.getQuest(questId);
        assertEq(uint256(q.status), uint256(IClawQuests.QuestStatus.PENDING_REVIEW), "status not PENDING_REVIEW");
        assertEq(q.resultURI, "ipfs://result123", "resultURI not set");
    }

    function test_RevertWhen_NonClaimerSubmits() public {
        uint256 questId = _createQuestWithStake();

        vm.prank(agent1);
        quests.claimQuest(questId);

        // agent2 (non-claimer) tries to submit
        vm.prank(agent2);
        vm.expectRevert();
        quests.submitResult(questId, "ipfs://fake");
    }

    // ============ Approval Tests ============

    function test_ApproveCompletion() public {
        uint256 questId = _createQuestWithStake();

        // Claim
        vm.prank(agent1);
        quests.claimQuest(questId);

        // Submit
        vm.prank(agent1);
        quests.submitResult(questId, "ipfs://result");

        // Calculate expected fees (no referral)
        uint256 platformFee = (HUNDRED_USDC * 500) / 10000; // 5 USDC
        uint256 netPayout = HUNDRED_USDC - platformFee;       // 95 USDC

        uint256 agentBalBefore = usdc.balanceOf(agent1);
        uint256 treasuryBalBefore = usdc.balanceOf(treasury);

        vm.expectEmit(true, true, false, true);
        emit IClawQuests.QuestCompleted(questId, agent1, netPayout, platformFee, 0);

        // Approve
        vm.prank(creator);
        quests.approveCompletion(questId);

        // Verify transfers
        assertEq(usdc.balanceOf(agent1), agentBalBefore + netPayout, "agent payout incorrect");
        assertEq(usdc.balanceOf(treasury), treasuryBalBefore + platformFee, "treasury fee incorrect");

        // Verify quest status
        IClawQuests.Quest memory q = quests.getQuest(questId);
        assertEq(uint256(q.status), uint256(IClawQuests.QuestStatus.COMPLETED));

        // Verify stats
        assertEq(quests.totalVolume(), HUNDRED_USDC);
        assertEq(quests.totalRevenue(), platformFee);
    }

    function test_ApproveCompletion_WithReferral() public {
        uint256 questId = _createQuestWithStake();

        // Claim with referral
        vm.prank(agent1);
        quests.claimQuestWithReferral(questId, referrer);

        // Submit
        vm.prank(agent1);
        quests.submitResult(questId, "ipfs://result");

        // Calculate expected fees
        uint256 totalPlatformFee = (HUNDRED_USDC * 500) / 10000; // 5 USDC
        uint256 referralFee = (totalPlatformFee * 2000) / 10000;  // 1 USDC (20% of 5)
        uint256 treasuryFee = totalPlatformFee - referralFee;     // 4 USDC
        uint256 netPayout = HUNDRED_USDC - totalPlatformFee;      // 95 USDC

        uint256 agentBalBefore = usdc.balanceOf(agent1);
        uint256 referrerBalBefore = usdc.balanceOf(referrer);
        uint256 treasuryBalBefore = usdc.balanceOf(treasury);

        // Approve
        vm.prank(creator);
        quests.approveCompletion(questId);

        // Verify transfers
        assertEq(usdc.balanceOf(agent1), agentBalBefore + netPayout, "agent payout incorrect");
        assertEq(usdc.balanceOf(referrer), referrerBalBefore + referralFee, "referrer fee incorrect");
        assertEq(usdc.balanceOf(treasury), treasuryBalBefore + treasuryFee, "treasury fee incorrect");

        // Verify referral earnings tracked
        assertEq(quests.referralEarnings(referrer), referralFee, "referral earnings not tracked");
    }

    function test_FeeCalculation() public {
        // 100 USDC bounty:
        // - Platform fee: 5 USDC (5%)
        // - Net payout: 95 USDC
        // - Referral share: 1 USDC (20% of 5 USDC)
        // - Treasury receives: 4 USDC
        uint256 questId = _createQuestWithStake();

        // Claim with referral
        vm.prank(agent1);
        quests.claimQuestWithReferral(questId, referrer);

        // Submit
        vm.prank(agent1);
        quests.submitResult(questId, "ipfs://result");

        uint256 agentBalBefore = usdc.balanceOf(agent1);
        uint256 referrerBalBefore = usdc.balanceOf(referrer);
        uint256 treasuryBalBefore = usdc.balanceOf(treasury);

        // Approve
        vm.prank(creator);
        quests.approveCompletion(questId);

        // Verify exact amounts
        assertEq(usdc.balanceOf(agent1) - agentBalBefore, 95e6, "net payout should be 95 USDC");
        assertEq(usdc.balanceOf(referrer) - referrerBalBefore, 1e6, "referral share should be 1 USDC");
        assertEq(usdc.balanceOf(treasury) - treasuryBalBefore, 4e6, "treasury should receive 4 USDC");
    }

    // ============ Rejection Tests ============

    function test_RejectCompletion() public {
        uint256 questId = _createQuestWithStake();

        vm.prank(agent1);
        quests.claimQuest(questId);

        vm.prank(agent1);
        quests.submitResult(questId, "ipfs://result");

        vm.expectEmit(true, true, false, true);
        emit IClawQuests.QuestRejected(questId, agent1, "Needs improvement");

        vm.prank(creator);
        quests.rejectCompletion(questId, "Needs improvement");

        IClawQuests.Quest memory q = quests.getQuest(questId);
        assertEq(uint256(q.status), uint256(IClawQuests.QuestStatus.CLAIMED), "status not reset to CLAIMED");
        assertEq(bytes(q.resultURI).length, 0, "resultURI not cleared");
    }

    function test_ResubmitAfterRejection() public {
        uint256 questId = _createQuestWithStake();

        vm.prank(agent1);
        quests.claimQuest(questId);

        // First submission
        vm.prank(agent1);
        quests.submitResult(questId, "ipfs://result1");

        // Reject
        vm.prank(creator);
        quests.rejectCompletion(questId, "Try again");

        // Resubmit
        vm.prank(agent1);
        quests.submitResult(questId, "ipfs://result2");

        IClawQuests.Quest memory q = quests.getQuest(questId);
        assertEq(uint256(q.status), uint256(IClawQuests.QuestStatus.PENDING_REVIEW), "status not PENDING_REVIEW after resubmit");
        assertEq(q.resultURI, "ipfs://result2", "resultURI not updated");
    }

    // ============ Reclaim Tests ============

    function test_ReclaimAfterTimeout() public {
        uint256 questId = _createQuestWithStake();

        vm.prank(agent1);
        quests.claimQuest(questId);

        // Fast-forward past 24h timeout
        vm.warp(block.timestamp + 25 hours);

        vm.expectEmit(true, true, false, true);
        emit IClawQuests.QuestReclaimed(questId, agent1);

        // Anyone can reclaim after timeout
        quests.reclaimQuest(questId);

        IClawQuests.Quest memory q = quests.getQuest(questId);
        assertEq(uint256(q.status), uint256(IClawQuests.QuestStatus.OPEN), "status not OPEN after reclaim");
        assertEq(q.claimer, address(0), "claimer not cleared");
        assertEq(q.claimedAt, 0, "claimedAt not cleared");

        // Verify added back to open quests
        uint256[] memory openQuests = quests.getOpenQuests();
        assertEq(openQuests.length, 1);
        assertEq(openQuests[0], questId);
    }

    function test_RevertWhen_ReclaimBeforeTimeout() public {
        uint256 questId = _createQuestWithStake();

        vm.prank(agent1);
        quests.claimQuest(questId);

        // Try to reclaim after only 23 hours (before 24h timeout)
        vm.warp(block.timestamp + 23 hours);

        vm.expectRevert();
        quests.reclaimQuest(questId);
    }

    function test_RevertWhen_ReclaimAfterSubmission() public {
        uint256 questId = _createQuestWithStake();

        vm.prank(agent1);
        quests.claimQuest(questId);

        // Submit result (status becomes PENDING_REVIEW)
        vm.prank(agent1);
        quests.submitResult(questId, "ipfs://result");

        // Fast-forward past timeout
        vm.warp(block.timestamp + 25 hours);

        // Cannot reclaim when status is PENDING_REVIEW
        vm.expectRevert();
        quests.reclaimQuest(questId);
    }

    // ============ Cancellation Tests ============

    function test_CancelQuest() public {
        uint256 questId = _createQuestWithStake();

        uint256 creatorBalBefore = usdc.balanceOf(creator);

        vm.expectEmit(true, false, false, true);
        emit IClawQuests.QuestCancelled(questId);

        vm.prank(creator);
        quests.cancelQuest(questId);

        // Verify bounty returned
        assertEq(usdc.balanceOf(creator), creatorBalBefore + HUNDRED_USDC, "bounty not returned");

        // Verify quest status
        IClawQuests.Quest memory q = quests.getQuest(questId);
        assertEq(uint256(q.status), uint256(IClawQuests.QuestStatus.CANCELLED), "status not CANCELLED");

        // Verify removed from open quests
        uint256[] memory openQuests = quests.getOpenQuests();
        assertEq(openQuests.length, 0, "quest not removed from open quests");
    }

    function test_RevertWhen_CancelClaimedQuest() public {
        uint256 questId = _createQuestWithStake();

        vm.prank(agent1);
        quests.claimQuest(questId);

        vm.prank(creator);
        vm.expectRevert();
        quests.cancelQuest(questId);
    }

    // ============ View Function Tests ============

    function test_GetOpenQuests() public {
        // Create multiple quests
        uint256 questId1 = _createQuestWithStake();

        vm.startPrank(creator);
        string[] memory tags = new string[](1);
        tags[0] = "test";
        uint256 questId2 = quests.createQuest("Quest 2", "Desc 2", HUNDRED_USDC, tags, block.timestamp + 7 days);
        uint256 questId3 = quests.createQuest("Quest 3", "Desc 3", HUNDRED_USDC, tags, block.timestamp + 7 days);
        vm.stopPrank();

        uint256[] memory openQuests = quests.getOpenQuests();
        assertEq(openQuests.length, 3, "should have 3 open quests");

        // Claim one quest and verify open quests updated
        vm.prank(agent1);
        quests.claimQuest(questId2);

        openQuests = quests.getOpenQuests();
        assertEq(openQuests.length, 2, "should have 2 open quests after claim");

        // Verify the remaining quests are questId1 and questId3
        bool hasQuest1;
        bool hasQuest3;
        for (uint256 i = 0; i < openQuests.length; i++) {
            if (openQuests[i] == questId1) hasQuest1 = true;
            if (openQuests[i] == questId3) hasQuest3 = true;
        }
        assertTrue(hasQuest1, "quest 1 should be in open quests");
        assertTrue(hasQuest3, "quest 3 should be in open quests");
    }

    function test_GetQuestsByCreator() public {
        uint256 questId1 = _createQuestWithStake();

        vm.startPrank(creator);
        string[] memory tags = new string[](1);
        tags[0] = "test";
        uint256 questId2 = quests.createQuest("Quest 2", "Desc 2", HUNDRED_USDC, tags, block.timestamp + 7 days);
        vm.stopPrank();

        uint256[] memory creatorQuests = quests.getQuestsByCreator(creator);
        assertEq(creatorQuests.length, 2, "creator should have 2 quests");
        assertEq(creatorQuests[0], questId1);
        assertEq(creatorQuests[1], questId2);

        // Different creator should have no quests
        uint256[] memory agent1Quests = quests.getQuestsByCreator(agent1);
        assertEq(agent1Quests.length, 0, "agent1 should have no created quests");
    }

    // ============ NFT Metadata Tests ============

    function test_TokenURI() public {
        uint256 questId = _createQuestWithStake();

        string memory uri = quests.tokenURI(questId);

        // Verify it starts with the data URI prefix
        bytes memory uriBytes = bytes(uri);
        assertTrue(uriBytes.length > 0, "tokenURI should not be empty");

        // Verify it's a data URI (starts with "data:")
        assertEq(uriBytes[0], bytes1("d"));
        assertEq(uriBytes[1], bytes1("a"));
        assertEq(uriBytes[2], bytes1("t"));
        assertEq(uriBytes[3], bytes1("a"));
        assertEq(uriBytes[4], bytes1(":"));
    }

    // ============ Edge Cases ============

    function test_MultipleQuestsFromSameCreator() public {
        vm.startPrank(creator);
        quests.stake(TEN_USDC);

        string[] memory tags = new string[](1);
        tags[0] = "test";

        uint256 q1 = quests.createQuest("Quest 1", "Desc 1", HUNDRED_USDC, tags, block.timestamp + 7 days);
        uint256 q2 = quests.createQuest("Quest 2", "Desc 2", 50 * ONE_USDC, tags, block.timestamp + 14 days);
        uint256 q3 = quests.createQuest("Quest 3", "Desc 3", 25 * ONE_USDC, tags, block.timestamp + 21 days);
        vm.stopPrank();

        // Verify all tracked
        uint256[] memory creatorQuests = quests.getQuestsByCreator(creator);
        assertEq(creatorQuests.length, 3);
        assertEq(creatorQuests[0], q1);
        assertEq(creatorQuests[1], q2);
        assertEq(creatorQuests[2], q3);

        // Verify total quests counter
        assertEq(quests.totalQuests(), 3);

        // Verify each has correct bounty
        assertEq(quests.getQuest(q1).bountyAmount, HUNDRED_USDC);
        assertEq(quests.getQuest(q2).bountyAmount, 50 * ONE_USDC);
        assertEq(quests.getQuest(q3).bountyAmount, 25 * ONE_USDC);

        // Verify all open
        uint256[] memory openQuests = quests.getOpenQuests();
        assertEq(openQuests.length, 3);
    }

    function test_SameAgentClaimsMultipleQuests() public {
        // Create two quests
        vm.startPrank(creator);
        quests.stake(TEN_USDC);

        string[] memory tags = new string[](1);
        tags[0] = "test";

        uint256 q1 = quests.createQuest("Quest 1", "Desc 1", HUNDRED_USDC, tags, block.timestamp + 7 days);
        uint256 q2 = quests.createQuest("Quest 2", "Desc 2", 50 * ONE_USDC, tags, block.timestamp + 7 days);
        vm.stopPrank();

        // Agent claims both quests
        vm.startPrank(agent1);
        quests.claimQuest(q1);
        quests.claimQuest(q2);
        vm.stopPrank();

        // Verify agent's claimed quests
        uint256[] memory claimerQuests = quests.getQuestsByClaimer(agent1);
        assertEq(claimerQuests.length, 2);
        assertEq(claimerQuests[0], q1);
        assertEq(claimerQuests[1], q2);

        // Verify both are CLAIMED
        assertEq(uint256(quests.getQuest(q1).status), uint256(IClawQuests.QuestStatus.CLAIMED));
        assertEq(uint256(quests.getQuest(q2).status), uint256(IClawQuests.QuestStatus.CLAIMED));

        // Verify no open quests remain
        assertEq(quests.getOpenQuests().length, 0);
    }

    // ============ Admin Function Tests ============

    function test_WithdrawFees() public {
        // Create a quest (generates CREATION_FEE)
        uint256 questId = _createQuestWithStake();

        // Complete the quest (generates platform fee)
        vm.prank(agent1);
        quests.claimQuest(questId);
        vm.prank(agent1);
        quests.submitResult(questId, "ipfs://result");
        vm.prank(creator);
        quests.approveCompletion(questId);

        uint256 fees = quests.accumulatedFees();
        assertTrue(fees > 0, "should have accumulated fees");

        uint256 treasuryBalBefore = usdc.balanceOf(treasury);

        // Owner withdraws fees
        quests.withdrawFees();

        assertEq(quests.accumulatedFees(), 0, "fees not zeroed after withdrawal");
        assertEq(usdc.balanceOf(treasury), treasuryBalBefore + fees, "treasury didn't receive fees");
    }

    function test_SetTreasury() public {
        address newTreasury = address(0xBEEF);
        quests.setTreasury(newTreasury);
        assertEq(quests.treasury(), newTreasury, "treasury not updated");
    }

    function test_RevertWhen_NonOwnerWithdrawsFees() public {
        vm.prank(agent1);
        vm.expectRevert();
        quests.withdrawFees();
    }

    function test_RevertWhen_NonOwnerSetsTreasury() public {
        vm.prank(agent1);
        vm.expectRevert();
        quests.setTreasury(address(0xBEEF));
    }

    function test_RevertWhen_SetTreasuryToZero() public {
        vm.expectRevert();
        quests.setTreasury(address(0));
    }

    function test_RevertWhen_WithdrawFeesWithNoFees() public {
        vm.expectRevert();
        quests.withdrawFees();
    }

    // ============ Access Control Tests ============

    function test_RevertWhen_NonCreatorApproves() public {
        uint256 questId = _createQuestWithStake();
        vm.prank(agent1);
        quests.claimQuest(questId);
        vm.prank(agent1);
        quests.submitResult(questId, "ipfs://result");

        vm.prank(agent2);
        vm.expectRevert();
        quests.approveCompletion(questId);
    }

    function test_RevertWhen_NonCreatorRejects() public {
        uint256 questId = _createQuestWithStake();
        vm.prank(agent1);
        quests.claimQuest(questId);
        vm.prank(agent1);
        quests.submitResult(questId, "ipfs://result");

        vm.prank(agent2);
        vm.expectRevert();
        quests.rejectCompletion(questId, "bad");
    }

    function test_RevertWhen_NonCreatorCancels() public {
        uint256 questId = _createQuestWithStake();

        vm.prank(agent1);
        vm.expectRevert();
        quests.cancelQuest(questId);
    }

    function test_RevertWhen_UnregisteredAgentClaims() public {
        uint256 questId = _createQuestWithStake();

        // Use a new address that was not minted an identity in setUp()
        address unregisteredAgent = address(0x6);

        vm.prank(unregisteredAgent);
        vm.expectRevert("Not a registered agent");
        quests.claimQuest(questId);
    }

    function test_RevertWhen_CreatorClaimsOwnQuest() public {
        uint256 questId = _createQuestWithStake();

        vm.prank(creator);
        vm.expectRevert();
        quests.claimQuest(questId);
    }

    function test_RevertWhen_SelfReferral() public {
        uint256 questId = _createQuestWithStake();

        vm.prank(agent1);
        vm.expectRevert();
        quests.claimQuestWithReferral(questId, agent1);
    }

    function test_RevertWhen_ZeroAddressReferral() public {
        uint256 questId = _createQuestWithStake();

        vm.prank(agent1);
        vm.expectRevert();
        quests.claimQuestWithReferral(questId, address(0));
    }

    // ============ Input Validation Tests ============

    function test_RevertWhen_TitleTooLong() public {
        vm.startPrank(creator);
        quests.stake(TEN_USDC);

        string[] memory tags = new string[](1);
        tags[0] = "test";

        // 101 chars
        bytes memory longTitle = new bytes(101);
        for (uint256 i = 0; i < 101; i++) longTitle[i] = "A";

        vm.expectRevert();
        quests.createQuest(string(longTitle), "Desc", HUNDRED_USDC, tags, block.timestamp + 7 days);
        vm.stopPrank();
    }

    function test_RevertWhen_DescriptionTooLong() public {
        vm.startPrank(creator);
        quests.stake(TEN_USDC);

        string[] memory tags = new string[](1);
        tags[0] = "test";

        // 2001 chars
        bytes memory longDesc = new bytes(2001);
        for (uint256 i = 0; i < 2001; i++) longDesc[i] = "A";

        vm.expectRevert();
        quests.createQuest("Title", string(longDesc), HUNDRED_USDC, tags, block.timestamp + 7 days);
        vm.stopPrank();
    }

    function test_RevertWhen_TooManySkillTags() public {
        vm.startPrank(creator);
        quests.stake(TEN_USDC);

        string[] memory tags = new string[](6);
        for (uint256 i = 0; i < 6; i++) tags[i] = "tag";

        vm.expectRevert();
        quests.createQuest("Title", "Desc", HUNDRED_USDC, tags, block.timestamp + 7 days);
        vm.stopPrank();
    }

    function test_RevertWhen_StakeZeroAmount() public {
        vm.prank(creator);
        vm.expectRevert();
        quests.stake(0);
    }

    function test_RevertWhen_UnstakeZeroAmount() public {
        vm.prank(creator);
        quests.stake(TEN_USDC);

        vm.prank(creator);
        vm.expectRevert();
        quests.unstake(0);
    }

    function test_RevertWhen_UnstakeMoreThanStaked() public {
        vm.prank(creator);
        quests.stake(TEN_USDC);

        vm.prank(creator);
        vm.expectRevert();
        quests.unstake(20 * ONE_USDC);
    }

    function test_RevertWhen_SubmitOnNonClaimedQuest() public {
        uint256 questId = _createQuestWithStake();

        // Quest is OPEN, not CLAIMED — should revert
        vm.prank(agent1);
        vm.expectRevert();
        quests.submitResult(questId, "ipfs://result");
    }

    function test_RevertWhen_SubmitEmptyResultURI() public {
        uint256 questId = _createQuestWithStake();
        vm.prank(agent1);
        quests.claimQuest(questId);

        vm.prank(agent1);
        vm.expectRevert();
        quests.submitResult(questId, "");
    }

    function test_RevertWhen_ApproveNonPendingQuest() public {
        uint256 questId = _createQuestWithStake();

        // Quest is OPEN, not PENDING_REVIEW
        vm.prank(creator);
        vm.expectRevert();
        quests.approveCompletion(questId);
    }

    function test_RevertWhen_RejectNonPendingQuest() public {
        uint256 questId = _createQuestWithStake();

        vm.prank(creator);
        vm.expectRevert();
        quests.rejectCompletion(questId, "nope");
    }

    function test_RevertWhen_GetNonExistentQuest() public {
        vm.expectRevert();
        quests.getQuest(999);
    }

    // ============ View Function Tests (additional) ============

    function test_OpenQuestCount() public {
        assertEq(quests.openQuestCount(), 0, "should start at 0");

        uint256 questId = _createQuestWithStake();
        assertEq(quests.openQuestCount(), 1, "should be 1 after creation");

        vm.prank(agent1);
        quests.claimQuest(questId);
        assertEq(quests.openQuestCount(), 0, "should be 0 after claim");
    }

    function test_GetQuestsByClaimer() public {
        // No quests claimed initially
        uint256[] memory empty = quests.getQuestsByClaimer(agent1);
        assertEq(empty.length, 0, "should start empty");

        uint256 questId = _createQuestWithStake();
        vm.prank(agent1);
        quests.claimQuest(questId);

        uint256[] memory claimed = quests.getQuestsByClaimer(agent1);
        assertEq(claimed.length, 1);
        assertEq(claimed[0], questId);
    }

    // ============ Lifecycle & Flow Tests ============

    function test_FullLifecycle() public {
        // 1. Creator stakes
        vm.prank(creator);
        quests.stake(TEN_USDC);

        // 2. Creator creates quest (50 USDC bounty)
        vm.startPrank(creator);
        string[] memory tags = new string[](1);
        tags[0] = "full-test";
        uint256 questId = quests.createQuest("Full Lifecycle", "End to end", 50 * ONE_USDC, tags, block.timestamp + 7 days);
        vm.stopPrank();

        // 3. Agent claims with referral
        vm.prank(agent1);
        quests.claimQuestWithReferral(questId, referrer);

        // 4. Agent submits
        vm.prank(agent1);
        quests.submitResult(questId, "ipfs://final-result");

        // 5. Snapshot balances before approval
        uint256 agentBal = usdc.balanceOf(agent1);
        uint256 referrerBal = usdc.balanceOf(referrer);
        uint256 treasuryBal = usdc.balanceOf(treasury);

        // 6. Creator approves
        vm.prank(creator);
        quests.approveCompletion(questId);

        // 7. Verify payouts: 50 USDC bounty, 5% fee = 2.5 USDC, 20% referral = 0.5 USDC
        assertEq(usdc.balanceOf(agent1) - agentBal, 47_500_000, "agent payout wrong"); // 47.5 USDC
        assertEq(usdc.balanceOf(referrer) - referrerBal, 500_000, "referrer payout wrong"); // 0.5 USDC
        assertEq(usdc.balanceOf(treasury) - treasuryBal, 2_000_000, "treasury payout wrong"); // 2 USDC

        // 8. Verify stats
        assertEq(quests.totalVolume(), 50 * ONE_USDC);
        assertEq(quests.totalQuests(), 1);
        assertEq(uint256(quests.getQuest(questId).status), uint256(IClawQuests.QuestStatus.COMPLETED));

        // 9. Creator unstakes (no active quests now)
        vm.prank(creator);
        quests.unstake(TEN_USDC);
        assertEq(quests.stakes(creator), 0);
    }

    function test_ReclaimThenReclaim() public {
        uint256 questId = _createQuestWithStake();

        // Agent1 claims
        vm.prank(agent1);
        quests.claimQuest(questId);

        // Timeout, reclaim
        vm.warp(block.timestamp + 25 hours);
        quests.reclaimQuest(questId);

        // Quest is OPEN again — agent2 can claim
        vm.prank(agent2);
        quests.claimQuest(questId);

        IClawQuests.Quest memory q = quests.getQuest(questId);
        assertEq(q.claimer, agent2, "agent2 should be new claimer");
        assertEq(uint256(q.status), uint256(IClawQuests.QuestStatus.CLAIMED));
    }

    function test_AccumulatedFeesTracking() public {
        // accumulatedFees starts at 0
        assertEq(quests.accumulatedFees(), 0);

        // Create quest — adds CREATION_FEE
        uint256 questId = _createQuestWithStake();
        uint256 creationFee = quests.CREATION_FEE();
        assertEq(quests.accumulatedFees(), creationFee, "creation fee not tracked");

        // Complete quest — adds platform fee (after referral split)
        vm.prank(agent1);
        quests.claimQuest(questId);
        vm.prank(agent1);
        quests.submitResult(questId, "ipfs://result");
        vm.prank(creator);
        quests.approveCompletion(questId);

        // Platform fee = 5 USDC, no referral so full fee goes to accumulated
        uint256 platformFee = (HUNDRED_USDC * 500) / 10000;
        assertEq(quests.accumulatedFees(), creationFee + platformFee, "platform fee not tracked");

        // Withdraw and verify zeroed
        quests.withdrawFees();
        assertEq(quests.accumulatedFees(), 0, "fees not zeroed after withdrawal");
    }

    function test_MultipleStakeIncrements() public {
        vm.startPrank(creator);
        quests.stake(5 * ONE_USDC);
        assertEq(quests.stakes(creator), 5 * ONE_USDC);

        quests.stake(5 * ONE_USDC);
        assertEq(quests.stakes(creator), TEN_USDC, "stakes should be additive");

        quests.stake(10 * ONE_USDC);
        assertEq(quests.stakes(creator), 20 * ONE_USDC, "stakes should accumulate");
        vm.stopPrank();
    }

    // ============ Fuzz Tests ============

    function testFuzz_StakeAndUnstake(uint256 amount) public {
        // Bound to reasonable USDC amounts (1 USDC to 1M USDC)
        amount = bound(amount, ONE_USDC, 1_000_000 * ONE_USDC);

        usdc.mint(agent1, amount);
        vm.prank(agent1);
        usdc.approve(address(quests), amount);

        vm.prank(agent1);
        quests.stake(amount);
        assertEq(quests.stakes(agent1), amount);

        vm.prank(agent1);
        quests.unstake(amount);
        assertEq(quests.stakes(agent1), 0);
    }

    function testFuzz_BountyFeeCalculation(uint256 bounty) public {
        // Bound bounty: min 1 USDC, max 10M USDC
        bounty = bound(bounty, ONE_USDC, 10_000_000 * ONE_USDC);

        // Fund creator with enough USDC
        usdc.mint(creator, bounty + ONE_USDC);
        vm.prank(creator);
        usdc.approve(address(quests), type(uint256).max);

        vm.startPrank(creator);
        quests.stake(TEN_USDC);
        string[] memory tags = new string[](1);
        tags[0] = "fuzz";
        uint256 questId = quests.createQuest("Fuzz", "Desc", bounty, tags, block.timestamp + 7 days);
        vm.stopPrank();

        vm.prank(agent1);
        quests.claimQuest(questId);
        vm.prank(agent1);
        quests.submitResult(questId, "ipfs://fuzz");

        uint256 agentBalBefore = usdc.balanceOf(agent1);
        uint256 treasuryBalBefore = usdc.balanceOf(treasury);

        vm.prank(creator);
        quests.approveCompletion(questId);

        uint256 expectedPlatformFee = (bounty * 500) / 10000;
        uint256 expectedNetPayout = bounty - expectedPlatformFee;

        assertEq(usdc.balanceOf(agent1) - agentBalBefore, expectedNetPayout, "fuzz: agent payout wrong");
        assertEq(usdc.balanceOf(treasury) - treasuryBalBefore, expectedPlatformFee, "fuzz: treasury fee wrong");
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

// ============ Mock ERC721 ============

contract MockERC721 {
    string public name;
    string public symbol;
    
    mapping(address => uint256) public balanceOf;
    mapping(uint256 => address) public ownerOf;
    
    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
    }
    
    function mint(address to, uint256 tokenId) external {
        ownerOf[tokenId] = to;
        balanceOf[to]++;
    }
}
