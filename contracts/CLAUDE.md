# ClawQuests Smart Contract — Implementation Guide

**Your Mission:** Implement the complete `ClawQuests.sol` smart contract and all tests.

**Chain:** Base (EVM-compatible L2)
**Language:** Solidity ^0.8.20
**Framework:** Foundry

---

## Quick Start

```bash
# Build
forge build

# Test
forge test -vvv

# Test with gas report
forge test --gas-report
```

---

## Files Overview

| File | Status | Description |
|------|--------|-------------|
| `src/IClawQuests.sol` | ✅ Complete | Interface specification (DO NOT MODIFY) |
| `src/ClawQuests.sol` | 🔧 TODO | Main contract (implement all TODO functions) |
| `test/ClawQuests.t.sol` | 🔧 TODO | Test suite (implement all test_ functions) |

---

## Contract Architecture

### Storage Layout

```solidity
// Quest ID counter (starts at 1)
uint256 private _nextQuestId = 1;

// Quest data
mapping(uint256 => Quest) private _quests;

// Open quest tracking (for efficient enumeration)
uint256[] private _openQuestIds;
mapping(uint256 => uint256) private _openQuestIndex;

// User data
mapping(address => uint256) public stakes;           // USDC staked
mapping(address => address) public referrers;        // Permanent referrer
mapping(address => uint256) public referralEarnings; // Total earned from referrals
mapping(address => uint256[]) private _creatorQuests;
mapping(address => uint256[]) private _claimerQuests;

// Platform stats
uint256 public totalQuests;
uint256 public totalVolume;
uint256 public totalRevenue;
```

### Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `MIN_STAKE_AMOUNT` | 10 USDC (10e6) | Minimum stake to create quests |
| `CREATION_FEE` | 0.10 USDC (0.1e6) | Flat fee per quest creation |
| `PLATFORM_FEE_BPS` | 500 (5%) | Percentage of bounty on completion |
| `REFERRAL_SHARE_BPS` | 2000 (20%) | Referrer's share of platform fee |
| `CLAIM_TIMEOUT` | 24 hours | Time before quest can be reclaimed |
| `MIN_BOUNTY` | 1 USDC (1e6) | Minimum bounty amount |

---

## Function Implementations

### 1. `createQuest`

```
INPUTS:
- title: string (max 100 chars)
- description: string (max 2000 chars)
- bountyAmount: uint256 (>= MIN_BOUNTY)
- skillTags: string[] (max 5 tags)
- deadline: uint256 (> block.timestamp)

VALIDATION:
1. stakes[msg.sender] >= MIN_STAKE_AMOUNT
2. bountyAmount >= MIN_BOUNTY
3. deadline > block.timestamp
4. bytes(title).length <= 100
5. bytes(description).length <= 2000
6. skillTags.length <= 5

LOGIC:
1. Transfer (bountyAmount + CREATION_FEE) from caller to contract
2. Increment _nextQuestId
3. Create Quest struct with status = OPEN
4. _mint(msg.sender, questId)  // Creator owns the NFT
5. _addToOpenQuests(questId)
6. _creatorQuests[msg.sender].push(questId)
7. totalQuests++
8. Emit QuestCreated

RETURNS: questId
```

### 2. `claimQuest` / `claimQuestWithReferral`

```
VALIDATION:
1. Quest exists
2. Quest status == OPEN
3. msg.sender != quest.creator (can't claim own quest)
4. For referral: referrer != address(0) && referrer != msg.sender

LOGIC:
1. Set quest.claimer = msg.sender
2. Set quest.claimedAt = block.timestamp
3. Set quest.status = CLAIMED
4. _removeFromOpenQuests(questId)
5. _claimerQuests[msg.sender].push(questId)
6. If referral AND referrers[msg.sender] == address(0):
   - referrers[msg.sender] = referrer (permanent!)
   - Emit ReferralRegistered
7. Emit QuestClaimed(questId, msg.sender, referrer or address(0))
```

### 3. `submitResult`

```
VALIDATION:
1. Quest exists
2. msg.sender == quest.claimer
3. quest.status == CLAIMED
4. bytes(resultURI).length > 0

LOGIC:
1. quest.resultURI = resultURI
2. quest.status = PENDING_REVIEW
3. Emit ResultSubmitted
```

### 4. `approveCompletion`

```
VALIDATION:
1. Quest exists
2. msg.sender == quest.creator (ownerOf(questId))
3. quest.status == PENDING_REVIEW

FEE CALCULATION:
platformFee = (bountyAmount * PLATFORM_FEE_BPS) / 10000
netPayout = bountyAmount - platformFee

referralFee = 0
if (referrers[claimer] != address(0)):
    referralFee = (platformFee * REFERRAL_SHARE_BPS) / 10000
    platformFee = platformFee - referralFee

LOGIC:
1. Transfer netPayout to claimer
2. If referralFee > 0:
   - Transfer referralFee to referrers[claimer]
   - referralEarnings[referrers[claimer]] += referralFee
3. Transfer platformFee to treasury
4. quest.status = COMPLETED
5. totalVolume += bountyAmount
6. totalRevenue += (original platformFee before referral split)
7. Emit QuestCompleted
```

### 5. `rejectCompletion`

```
VALIDATION:
1. Quest exists
2. msg.sender == quest.creator
3. quest.status == PENDING_REVIEW

LOGIC:
1. quest.status = CLAIMED (resets, claimer can try again)
2. quest.resultURI = "" (clear submission)
3. Emit QuestRejected
```

### 6. `reclaimQuest`

```
VALIDATION:
1. Quest exists
2. quest.status == CLAIMED (not PENDING_REVIEW!)
3. block.timestamp > quest.claimedAt + CLAIM_TIMEOUT

LOGIC:
1. address previousClaimer = quest.claimer
2. quest.claimer = address(0)
3. quest.claimedAt = 0
4. quest.status = OPEN
5. _addToOpenQuests(questId)
6. Emit QuestReclaimed
```

### 7. `cancelQuest`

```
VALIDATION:
1. Quest exists
2. msg.sender == quest.creator
3. quest.status == OPEN

LOGIC:
1. Transfer bountyAmount back to creator
2. quest.status = CANCELLED
3. _removeFromOpenQuests(questId)
4. Emit QuestCancelled
```

### 8. `stake`

```
VALIDATION:
1. amount > 0

LOGIC:
1. Transfer amount from caller to contract
2. stakes[msg.sender] += amount
3. Emit Staked
```

### 9. `unstake`

```
VALIDATION:
1. amount > 0
2. stakes[msg.sender] >= amount
3. If user has active quests (status OPEN or CLAIMED):
   - Remaining stake must be >= MIN_STAKE_AMOUNT

LOGIC:
1. stakes[msg.sender] -= amount
2. Transfer amount to caller
3. Emit Unstaked
```

---

## Test Implementation Guide

Each test function in `ClawQuests.t.sol` needs implementation. Here's what each should verify:

### Staking Tests
- `test_Stake`: Verify balance transfers, stake mapping updates, event emission
- `test_Unstake`: Verify reverse of stake
- `test_RevertWhen_UnstakeBelowMinWithActiveQuests`: Create quest, try to unstake all → revert

### Quest Creation Tests
- `test_CreateQuest`: Full happy path, verify all state changes
- `test_RevertWhen_CreateQuestWithoutStake`: Should revert with proper error
- `test_RevertWhen_BountyBelowMinimum`: 0.5 USDC should fail
- `test_RevertWhen_DeadlineInPast`: `block.timestamp - 1` should fail

### Claiming Tests
- `test_ClaimQuest`: Verify status change, claimer set, removed from open
- `test_ClaimQuestWithReferral`: Verify referrer is set
- `test_ReferralPersistence`: Claim with ref A, claim another with ref B → still A

### Approval Tests
- `test_ApproveCompletion`: Verify all transfers, status change
- `test_ApproveCompletion_WithReferral`: Verify referral fee math
- `test_FeeCalculation`: Exact math verification (see FEE CALCULATION above)

### Rejection/Reclaim Tests
- `test_RejectCompletion`: Status back to CLAIMED
- `test_ResubmitAfterRejection`: Can submit new resultURI
- `test_ReclaimAfterTimeout`: Use `vm.warp(block.timestamp + 25 hours)`
- `test_RevertWhen_ReclaimBeforeTimeout`: Should fail
- `test_RevertWhen_ReclaimAfterSubmission`: If PENDING_REVIEW, cannot reclaim

### Cancellation Tests
- `test_CancelQuest`: Bounty returned, status CANCELLED
- `test_RevertWhen_CancelClaimedQuest`: Should revert

---

## Security Considerations

1. **Reentrancy**: All external calls (USDC transfers) should be at the end of functions. Contract uses `ReentrancyGuard`.

2. **Integer overflow**: Not a concern with Solidity 0.8+

3. **Access control**: 
   - Only creator can approve/reject/cancel
   - Only claimer can submit
   - Anyone can reclaim (after timeout)

4. **Front-running**: 
   - Quest claiming is first-come-first-served (acceptable for MVP)

5. **USDC decimals**: Always use 6 decimals (1e6 = 1 USDC)

---

## SVG Generation (Bonus)

The `_generateSVG` function should create a pixel-art style card with:
- Background: Base blue (#0052FF)
- Accent: Lobster orange (#ff4a00)
- Quest title
- Bounty amount
- Status badge
- Pixel-art border/decoration

Keep it simple — can be enhanced later.

---

## Checklist

Before submitting, ensure:

- [ ] All functions implemented (no TODO remaining)
- [ ] All tests pass: `forge test`
- [ ] No compiler warnings: `forge build`
- [ ] Gas optimization: Check `forge test --gas-report`
- [ ] Events emitted for all state changes
- [ ] Proper error messages for all reverts

---

## Commands Reference

```bash
# Full build
forge build

# Run all tests
forge test -vvv

# Run specific test
forge test --match-test test_CreateQuest -vvv

# Gas report
forge test --gas-report

# Format code
forge fmt

# Check coverage
forge coverage
```

Good luck! 🦞
