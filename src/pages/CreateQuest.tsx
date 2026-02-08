import { useState } from "react";
import { Link } from "react-router-dom";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import {
  getContracts,
  formatUSDC,
  parseUSDC,
} from "@/lib/blockchain/client";
import { CREATION_FEE_USDC } from "@/lib/blockchain/providers/baseProvider";

const contracts = getContracts();

export default function CreateQuest() {
  const { address } = useAccount();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bounty, setBounty] = useState("");
  const [tags, setTags] = useState("");
  const [deadline, setDeadline] = useState("");
  const [step, setStep] = useState<"form" | "approving" | "creating">("form");

  // Check user's stake
  const { data: userStake } = useReadContract({
    address: contracts.clawQuests.address,
    abi: contracts.clawQuests.abi,
    functionName: 'stakes',
    args: [address!],
    query: { enabled: !!address },
  });

  // Check min stake from contract
  const { data: minStakeAmount } = useReadContract({
    address: contracts.clawQuests.address,
    abi: contracts.clawQuests.abi,
    functionName: 'minStakeAmount',
  });

  // Check USDC allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: contracts.usdc.address,
    abi: contracts.usdc.abi,
    functionName: 'allowance',
    args: [address!, contracts.clawQuests.address],
    query: { enabled: !!address },
  });

  const { writeContract, data: txHash, isPending, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const minStake = minStakeAmount as bigint | undefined;
  const stakeOk = userStake !== undefined && minStake !== undefined && (userStake as bigint) >= minStake;
  const bountyNum = parseFloat(bounty) || 0;
  const bountyBigInt = bountyNum > 0 ? parseUSDC(bountyNum.toFixed(6)) : BigInt(0);
  const totalCost = bountyBigInt + CREATION_FEE_USDC;
  const needsApproval = !allowance || (allowance as bigint) < totalCost;

  // After approval is confirmed, move to create step
  if (isConfirmed && step === "approving") {
    refetchAllowance();
    reset();
    setStep("creating");
  }

  // After creation is confirmed
  if (isConfirmed && step === "creating") {
    setStep("form");
  }

  const handleApprove = () => {
    setStep("approving");
    writeContract({
      address: contracts.usdc.address,
      abi: contracts.usdc.abi,
      functionName: 'approve',
      args: [contracts.clawQuests.address, totalCost],
    });
  };

  const handleCreate = () => {
    const skillTags = tags.split(",").map((t) => t.trim()).filter(Boolean);
    const deadlineTimestamp = deadline
      ? BigInt(Math.floor(new Date(deadline).getTime() / 1000))
      : BigInt(Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60); // default: 7 days

    setStep("creating");
    writeContract({
      address: contracts.clawQuests.address,
      abi: contracts.clawQuests.abi,
      functionName: 'createQuest',
      args: [title, description, bountyBigInt, skillTags, deadlineTimestamp],
    });
  };

  const txBusy = isPending || isConfirming;

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-lg font-pixel text-accent mb-8">&gt; Create Quest_</h1>

      {/* Wallet check */}
      {!address && (
        <div className="p-3 border-2 border-destructive/40 bg-destructive/10 text-destructive font-pixel text-[8px] mb-6">
          Please connect your wallet to create quests.
        </div>
      )}

      {/* Stake Check */}
      {address && stakeOk && (
        <div className="p-3 border-2 border-success/40 bg-success/10 text-success font-pixel text-[8px] mb-6">
          Minimum stake met ({userStake !== undefined ? formatUSDC(userStake as bigint) : '--'} USDC staked).
        </div>
      )}
      {address && !stakeOk && userStake !== undefined && (
        <div className="p-3 border-2 border-destructive/40 bg-destructive/10 text-destructive font-pixel text-[8px] mb-6">
          You must stake at least {minStake !== undefined ? formatUSDC(minStake) : '...'} USDC to create quests.{" "}
          <Link to="/staking" className="underline hover:text-accent">Go to Staking &rarr;</Link>
        </div>
      )}

      {/* Transaction feedback */}
      {txBusy && (
        <div className="p-3 border-2 border-primary/40 bg-primary/10 text-primary font-pixel text-[8px] mb-6 text-center">
          {isPending ? "Waiting for wallet confirmation..." : "Transaction confirming..."}
        </div>
      )}
      {isConfirmed && step === "form" && (
        <div className="p-3 border-2 border-success/40 bg-success/10 text-success font-pixel text-[8px] mb-6 text-center">
          Quest created successfully!
        </div>
      )}

      <div className="pixel-card p-6 md:p-8 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-[8px] font-pixel uppercase tracking-widest text-muted-foreground mb-2">
            Quest Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Short quest title"
            className="w-full bg-secondary border-2 border-primary/30 p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-[8px] font-pixel uppercase tracking-widest text-muted-foreground mb-2">
            Quest Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Describe the task for the AI agent..."
            className="w-full bg-secondary border-2 border-primary/30 p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent resize-none"
          />
        </div>

        {/* Skill Tags */}
        <div>
          <label className="block text-[8px] font-pixel uppercase tracking-widest text-muted-foreground mb-2">
            Skill Tags (comma-separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. Analysis, Solidity, DeFi"
            className="w-full bg-secondary border-2 border-primary/30 p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
          />
          {tags && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.split(",").map((t) => t.trim()).filter(Boolean).map((t) => (
                <span key={t} className="skill-tag">{t}</span>
              ))}
            </div>
          )}
        </div>

        {/* Bounty */}
        <div>
          <label className="block text-[8px] font-pixel uppercase tracking-widest text-muted-foreground mb-2">
            Bounty Amount (USDC)
          </label>
          <input
            type="number"
            min="1"
            step="0.01"
            value={bounty}
            onChange={(e) => setBounty(e.target.value)}
            placeholder="0.00"
            className="w-full bg-secondary border-2 border-primary/30 p-3 text-sm font-pixel text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
          />
        </div>

        {/* Deadline */}
        <div>
          <label className="block text-[8px] font-pixel uppercase tracking-widest text-muted-foreground mb-2">
            Deadline (optional, defaults to 7 days)
          </label>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full bg-secondary border-2 border-primary/30 p-3 text-sm text-foreground focus:outline-none focus:border-accent"
          />
        </div>

        {/* Cost Summary */}
        <div className="p-4 bg-muted/50 border-2 border-primary/20 space-y-2">
          <h3 className="text-[8px] font-pixel uppercase tracking-widest text-muted-foreground mb-3">Cost Summary</h3>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Bounty</span>
            <span className="font-pixel text-xs text-foreground">{bountyNum.toFixed(2)} USDC</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Creation Fee</span>
            <span className="font-pixel text-xs text-foreground">{formatUSDC(CREATION_FEE_USDC)} USDC</span>
          </div>
          <div className="border-t-2 border-primary/20 pt-2 mt-2 flex justify-between text-sm font-bold">
            <span className="text-foreground">Total Cost</span>
            <span className="font-pixel text-xs text-accent">
              {bountyNum > 0 ? formatUSDC(totalCost) : '0.00'} USDC
            </span>
          </div>
        </div>

        {needsApproval ? (
          <button
            className="pixel-btn w-full"
            disabled={!description || bountyNum <= 0 || !stakeOk || !address || txBusy}
            onClick={handleApprove}
          >
            {txBusy ? "Approving USDC..." : "Approve USDC"}
          </button>
        ) : (
          <button
            className="pixel-btn w-full"
            disabled={!description || bountyNum <= 0 || !stakeOk || !address || txBusy}
            onClick={handleCreate}
          >
            {txBusy ? "Creating Quest..." : "Create Quest"}
          </button>
        )}
      </div>
    </div>
  );
}
