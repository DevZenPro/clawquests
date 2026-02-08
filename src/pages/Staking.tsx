import { useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import {
  getContracts,
  formatUSDC,
  parseUSDC,
} from "@/lib/blockchain/client";

const contracts = getContracts();

export default function Staking() {
  const { address } = useAccount();
  const [amount, setAmount] = useState("");
  const [action, setAction] = useState<"idle" | "approving" | "staking" | "unstaking">("idle");

  const { data: currentStake, refetch: refetchStake } = useReadContract({
    address: contracts.clawQuests.address,
    abi: contracts.clawQuests.abi,
    functionName: 'stakes',
    args: [address!],
    query: { enabled: !!address },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: contracts.usdc.address,
    abi: contracts.usdc.abi,
    functionName: 'allowance',
    args: [address!, contracts.clawQuests.address],
    query: { enabled: !!address },
  });

  const { data: usdcBalance } = useReadContract({
    address: contracts.usdc.address,
    abi: contracts.usdc.abi,
    functionName: 'balanceOf',
    args: [address!],
    query: { enabled: !!address },
  });

  const { data: minStakeAmount } = useReadContract({
    address: contracts.clawQuests.address,
    abi: contracts.clawQuests.abi,
    functionName: 'minStakeAmount',
  });

  const { writeContract, data: txHash, isPending, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Refetch after confirmation
  if (isConfirmed) {
    refetchStake();
    refetchAllowance();
    if (action !== "idle") {
      reset();
      setAction("idle");
      setAmount("");
    }
  }

  const stakeAmount = currentStake as bigint | undefined;
  const minStake = minStakeAmount as bigint | undefined;
  const meetsMinimum = stakeAmount !== undefined && minStake !== undefined && stakeAmount >= minStake;
  const parsedAmount = parseFloat(amount) || 0;
  const parsedAmountBigInt = parsedAmount > 0 ? parseUSDC(parsedAmount.toFixed(6)) : BigInt(0);
  const needsApproval = !allowance || (allowance as bigint) < parsedAmountBigInt;

  const handleStake = () => {
    if (needsApproval) {
      setAction("approving");
      writeContract({
        address: contracts.usdc.address,
        abi: contracts.usdc.abi,
        functionName: 'approve',
        args: [contracts.clawQuests.address, parsedAmountBigInt],
      });
    } else {
      setAction("staking");
      writeContract({
        address: contracts.clawQuests.address,
        abi: contracts.clawQuests.abi,
        functionName: 'stake',
        args: [parsedAmountBigInt],
      });
    }
  };

  // After approval confirmed, auto-stake
  if (isConfirmed && action === "approving") {
    refetchAllowance();
    reset();
    setAction("staking");
    writeContract({
      address: contracts.clawQuests.address,
      abi: contracts.clawQuests.abi,
      functionName: 'stake',
      args: [parsedAmountBigInt],
    });
  }

  const handleUnstake = () => {
    setAction("unstaking");
    writeContract({
      address: contracts.clawQuests.address,
      abi: contracts.clawQuests.abi,
      functionName: 'unstake',
      args: [parsedAmountBigInt],
    });
  };

  const txBusy = isPending || isConfirming;

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-lg font-pixel text-accent mb-2">&gt; Staking_</h1>
      <p className="text-muted-foreground mb-8">
        A minimum stake of {minStake !== undefined ? formatUSDC(minStake) : '...'} USDC is required to create quests.
      </p>

      {!address && (
        <div className="p-3 border-2 border-destructive/40 bg-destructive/10 text-destructive font-pixel text-[8px] mb-6">
          Please connect your wallet to manage staking.
        </div>
      )}

      {/* Your Stake Card */}
      <div className="pixel-card p-6 md:p-8 mb-6">
        <h2 className="text-[8px] font-pixel uppercase tracking-widest text-muted-foreground mb-4">Your Stake</h2>
        <p className="text-xl font-pixel text-accent mb-3">
          {stakeAmount !== undefined ? formatUSDC(stakeAmount) : '--'} USDC
        </p>
        <div className="flex items-center gap-2">
          <span className="text-[8px] font-pixel text-muted-foreground">Minimum: {minStake !== undefined ? formatUSDC(minStake) : '...'} USDC</span>
          {stakeAmount !== undefined && (
            meetsMinimum ? (
              <span className="text-[8px] font-pixel text-success">Met</span>
            ) : (
              <span className="text-[8px] font-pixel text-destructive">Not met</span>
            )
          )}
        </div>
        {usdcBalance !== undefined && (
          <p className="text-[8px] font-pixel text-muted-foreground mt-2">
            Wallet USDC balance: {formatUSDC(usdcBalance as bigint)}
          </p>
        )}
      </div>

      {/* Transaction feedback */}
      {txBusy && (
        <div className="p-3 border-2 border-primary/40 bg-primary/10 text-primary font-pixel text-[8px] mb-6 text-center">
          {isPending ? "Waiting for wallet confirmation..." : "Transaction confirming..."}
        </div>
      )}

      {/* Manage Stake Form */}
      <div className="pixel-card p-6 md:p-8">
        <h2 className="text-[8px] font-pixel uppercase tracking-widest text-muted-foreground mb-4">Manage Stake</h2>
        <div className="mb-4">
          <label className="block text-[8px] font-pixel uppercase tracking-widest text-muted-foreground mb-2">
            Amount (USDC)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-secondary border-2 border-primary/30 p-3 text-sm font-pixel text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
          />
        </div>
        <div className="flex gap-3">
          <button
            className="pixel-btn flex-1"
            disabled={!amount || parsedAmount <= 0 || !address || txBusy}
            onClick={handleStake}
          >
            {txBusy && action === "staking" ? "Staking..." :
             txBusy && action === "approving" ? "Approving..." :
             needsApproval ? "Approve & Stake" : "Stake"}
          </button>
          <button
            className="pixel-btn-outline flex-1"
            disabled={!amount || parsedAmount <= 0 || !address || txBusy}
            onClick={handleUnstake}
          >
            {txBusy && action === "unstaking" ? "Unstaking..." : "Unstake"}
          </button>
        </div>
      </div>
    </div>
  );
}
