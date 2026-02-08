import { useParams, Link } from "react-router-dom";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import {
  getContracts,
  formatUSDC,
  QuestStatus,
  getQuestStatusLabel,
  canReclaimQuest,
  parseReferralFromUrl,
  formatTimeRemaining,
} from "@/lib/blockchain/client";
import { useState } from "react";

const contracts = getContracts();

export default function QuestDetail() {
  const { id } = useParams();
  const questId = BigInt(id || "0");
  const { address } = useAccount();
  const [resultText, setResultText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const { data: questData, isLoading, refetch } = useReadContract({
    address: contracts.clawQuests.address,
    abi: contracts.clawQuests.abi,
    functionName: 'getQuest',
    args: [questId],
  });

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Refetch after confirmation
  if (isConfirmed) {
    refetch();
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="font-pixel text-xs text-muted-foreground">&gt; Loading quest..._</p>
      </div>
    );
  }

  if (!questData) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="font-pixel text-xs text-muted-foreground">&gt; Quest not found._</p>
        <Link to="/quests" className="pixel-btn-outline !py-2 mt-4 inline-block !text-[8px]">Back to Quests</Link>
      </div>
    );
  }

  const quest = questData as {
    creator: string;
    claimer: string;
    title: string;
    description: string;
    resultURI: string;
    bountyAmount: bigint;
    createdAt: bigint;
    claimedAt: bigint;
    deadline: bigint;
    status: number;
    skillTags: string[];
  };

  const { creator, claimer, title, description, bountyAmount, createdAt, claimedAt, deadline } = quest;
  const questStatus = quest.status as QuestStatus;
  const isCreator = address && creator.toLowerCase() === address.toLowerCase();
  const isClaimer = address && claimer.toLowerCase() === address.toLowerCase();
  const timedOut = questStatus === QuestStatus.CLAIMED && canReclaimQuest(claimedAt);
  const referrer = parseReferralFromUrl();
  const zeroAddr = "0x0000000000000000000000000000000000000000";

  const handleClaim = () => {
    if (referrer) {
      writeContract({
        address: contracts.clawQuests.address,
        abi: contracts.clawQuests.abi,
        functionName: 'claimQuestWithReferral',
        args: [questId, referrer],
      });
    } else {
      writeContract({
        address: contracts.clawQuests.address,
        abi: contracts.clawQuests.abi,
        functionName: 'claimQuest',
        args: [questId],
      });
    }
  };

  const handleSubmit = () => {
    writeContract({
      address: contracts.clawQuests.address,
      abi: contracts.clawQuests.abi,
      functionName: 'submitResult',
      args: [questId, resultText],
    });
    setShowModal(false);
  };

  const handleApprove = () => {
    writeContract({
      address: contracts.clawQuests.address,
      abi: contracts.clawQuests.abi,
      functionName: 'approveCompletion',
      args: [questId],
    });
  };

  const handleReject = () => {
    writeContract({
      address: contracts.clawQuests.address,
      abi: contracts.clawQuests.abi,
      functionName: 'rejectCompletion',
      args: [questId, rejectReason],
    });
    setShowRejectModal(false);
  };

  const handleReclaim = () => {
    writeContract({
      address: contracts.clawQuests.address,
      abi: contracts.clawQuests.abi,
      functionName: 'reclaimQuest',
      args: [questId],
    });
  };

  const txBusy = isPending || isConfirming;

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Link to="/quests" className="inline-flex items-center gap-2 text-xs font-pixel text-muted-foreground hover:text-accent transition-colors mb-8">
        &larr; Back to Quests
      </Link>

      <div className="pixel-card p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-base font-pixel text-accent">Quest #{id}</h1>
          <span className={`px-2.5 py-0.5 text-[8px] font-pixel uppercase tracking-wider ${
            questStatus === QuestStatus.OPEN ? "status-open" :
            questStatus === QuestStatus.CLAIMED ? "status-claimed" :
            questStatus === QuestStatus.PENDING_REVIEW ? "status-pending" :
            "status-completed"
          }`}>
            {getQuestStatusLabel(questStatus)}
          </span>
        </div>

        {/* Title */}
        {title && (
          <h2 className="text-sm font-pixel text-foreground mb-4">{title}</h2>
        )}

        {/* Bounty */}
        <div className="bounty-badge text-sm inline-block mb-6">
          {formatUSDC(bountyAmount)} USDC
        </div>

        {/* Deadline */}
        {deadline > BigInt(0) && (
          <div className="mb-4">
            <span className="text-[8px] font-pixel uppercase tracking-widest text-muted-foreground">Deadline: </span>
            <span className="text-[8px] font-pixel text-foreground">{formatTimeRemaining(deadline)}</span>
          </div>
        )}

        {/* Description */}
        <div className="mb-6">
          <h3 className="text-[8px] font-pixel uppercase tracking-widest text-muted-foreground mb-2">Description</h3>
          <p className="text-foreground leading-relaxed">{description}</p>
        </div>

        {/* Transaction feedback */}
        {txBusy && (
          <div className="mb-4 p-3 border-2 border-primary/40 bg-primary/10 text-primary font-pixel text-[8px] text-center">
            {isPending ? "Waiting for wallet confirmation..." : "Transaction confirming..."}
          </div>
        )}
        {isConfirmed && (
          <div className="mb-4 p-3 border-2 border-success/40 bg-success/10 text-success font-pixel text-[8px] text-center">
            Transaction confirmed!
          </div>
        )}

        {/* Actions */}
        <div className="mb-6 space-y-3">
          {questStatus === QuestStatus.OPEN && !isCreator && (
            <button className="pixel-btn w-full" onClick={handleClaim} disabled={txBusy}>
              {txBusy ? "Claiming..." : "Claim Quest"}
            </button>
          )}

          {questStatus === QuestStatus.CLAIMED && isClaimer && !timedOut && (
            <button onClick={() => setShowModal(true)} className="pixel-btn w-full" disabled={txBusy}>
              Submit Result
            </button>
          )}

          {questStatus === QuestStatus.CLAIMED && timedOut && (
            <button className="pixel-btn w-full" onClick={handleReclaim} disabled={txBusy}
              style={{ background: "hsl(17 100% 50%)", borderColor: "hsl(17 80% 40%)" }}>
              {txBusy ? "Reclaiming..." : "Reclaim Quest"}
            </button>
          )}

          {questStatus === QuestStatus.PENDING_REVIEW && isCreator && (
            <div className="flex gap-3">
              <button className="pixel-btn flex-1" onClick={handleApprove} disabled={txBusy}
                style={{ background: "hsl(155 80% 35%)", borderColor: "hsl(155 60% 25%)" }}>
                {txBusy ? "..." : "Approve"}
              </button>
              <button className="pixel-btn flex-1" onClick={() => setShowRejectModal(true)} disabled={txBusy}
                style={{ background: "hsl(17 100% 50%)", borderColor: "hsl(17 80% 40%)" }}>
                Reject
              </button>
            </div>
          )}
        </div>

        {/* Timed out notice */}
        {questStatus === QuestStatus.CLAIMED && timedOut && (
          <div className="mb-6 p-3 border-2 border-warning/40 bg-warning/10 text-warning font-pixel text-[8px] text-center">
            This quest has been claimed for over 24 hours and is eligible for reclaim.
          </div>
        )}

        {/* Details */}
        <div className="border-t-2 border-primary/20 pt-6 space-y-3">
          <div className="flex justify-between text-sm items-center">
            <span className="text-muted-foreground font-pixel text-[8px]">Posted by</span>
            <span className="font-pixel text-[8px] text-foreground">{creator.slice(0, 6)}...{creator.slice(-4)}</span>
          </div>
          {claimer !== zeroAddr && (
            <div className="flex justify-between text-sm items-center">
              <span className="text-muted-foreground font-pixel text-[8px]">Claimed by</span>
              <span className="font-pixel text-[8px] text-foreground">{claimer.slice(0, 6)}...{claimer.slice(-4)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground font-pixel text-[8px]">Created</span>
            <span className="font-pixel text-[8px] text-foreground">{new Date(Number(createdAt) * 1000).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Submit Result Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90" onClick={() => setShowModal(false)}>
          <div className="pixel-card border-accent p-6 w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-sm font-pixel text-accent mb-4">&gt; Submit Result_</h2>
            <textarea
              value={resultText}
              onChange={(e) => setResultText(e.target.value)}
              rows={6}
              placeholder="Describe your quest result or paste an IPFS URI..."
              className="w-full bg-secondary border-2 border-primary/30 p-3 text-sm text-foreground font-body placeholder:text-muted-foreground focus:outline-none focus:border-accent resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button className="pixel-btn flex-1" onClick={handleSubmit} disabled={!resultText || txBusy}>
                {txBusy ? "Submitting..." : "Submit"}
              </button>
              <button onClick={() => setShowModal(false)} className="pixel-btn-outline flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90" onClick={() => setShowRejectModal(false)}>
          <div className="pixel-card border-accent p-6 w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-sm font-pixel text-accent mb-4">&gt; Reject Reason_</h2>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              placeholder="Explain why you are rejecting this submission..."
              className="w-full bg-secondary border-2 border-primary/30 p-3 text-sm text-foreground font-body placeholder:text-muted-foreground focus:outline-none focus:border-accent resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button className="pixel-btn flex-1" onClick={handleReject} disabled={!rejectReason || txBusy}
                style={{ background: "hsl(17 100% 50%)", borderColor: "hsl(17 80% 40%)" }}>
                {txBusy ? "Rejecting..." : "Reject"}
              </button>
              <button onClick={() => setShowRejectModal(false)} className="pixel-btn-outline flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
