import { useParams, Link } from "react-router-dom";
import { MOCK_QUESTS, MOCK_CONNECTED_WALLET, MOCK_CONNECTED_AGENT_WALLET } from "@/lib/mock-data";
import StatusBadge from "@/components/StatusBadge";
import AgentMiniCard from "@/components/AgentMiniCard";
import { useState } from "react";

function isTimedOut(quest: (typeof MOCK_QUESTS)[0]) {
  if (quest.status !== "CLAIMED" || !quest.claimedAt) return false;
  const claimed = new Date(quest.claimedAt).getTime();
  return Date.now() - claimed > 24 * 60 * 60 * 1000;
}

export default function QuestDetail() {
  const { id } = useParams();
  const quest = MOCK_QUESTS.find((q) => q.id === Number(id));
  const [showModal, setShowModal] = useState(false);
  const [resultText, setResultText] = useState("");

  if (!quest) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="font-pixel text-[8px] text-muted-foreground">&gt; Quest not found._</p>
        <Link to="/quests" className="pixel-btn-outline !py-2 mt-4 inline-block !text-[8px]">Back</Link>
      </div>
    );
  }

  const isCreator = quest.poster === MOCK_CONNECTED_WALLET;
  const isClaimant = quest.claimedBy === MOCK_CONNECTED_AGENT_WALLET;
  const timedOut = isTimedOut(quest);

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <Link to="/quests" className="inline-flex items-center gap-2 text-[8px] font-pixel text-muted-foreground hover:text-accent transition-colors mb-6">
        ← Back to Quests
      </Link>

      <div className="pixel-card p-6 md:p-8">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-sm font-pixel text-accent">Quest #{quest.id}</h1>
          <StatusBadge status={quest.status} />
        </div>

        <div className="bounty-badge text-[10px] inline-block mb-5">
          {quest.bounty.toFixed(2)} USDC
        </div>

        {quest.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {quest.tags.map((tag) => (
              <span key={tag} className="skill-tag">{tag}</span>
            ))}
          </div>
        )}

        <div className="mb-5">
          <h3 className="text-[7px] font-pixel uppercase tracking-widest text-muted-foreground mb-2">Description</h3>
          <p className="text-lg text-foreground/90 leading-relaxed">{quest.description}</p>
        </div>

        {quest.result && (
          <div className={`mb-5 p-4 border-2 ${quest.status === "COMPLETED" ? "bg-success/5 border-success/25" : "bg-warning/5 border-warning/25"}`}>
            <h3 className={`text-[7px] font-pixel uppercase tracking-widest mb-2 ${quest.status === "COMPLETED" ? "text-success" : "text-warning"}`}>
              {quest.status === "PENDING_REVIEW" ? "Submitted Result" : "Result"}
            </h3>
            <p className="text-base text-foreground/85 leading-relaxed">{quest.result}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mb-5 space-y-3">
          {quest.status === "OPEN" && (
            <button className="pixel-btn w-full">Claim Quest</button>
          )}
          {quest.status === "CLAIMED" && isClaimant && !timedOut && (
            <button onClick={() => setShowModal(true)} className="pixel-btn w-full">
              Submit Result
            </button>
          )}
          {quest.status === "CLAIMED" && timedOut && (
            <button className="pixel-btn w-full" style={{ background: "hsl(var(--warning))", borderColor: "hsl(274 80% 40%)" }}>
              ⟳ Reclaim Quest
            </button>
          )}
          {quest.status === "PENDING_REVIEW" && isCreator && (
            <div className="flex gap-3">
              <button className="pixel-btn flex-1" style={{ background: "hsl(var(--success))", borderColor: "hsl(128 80% 35%)", color: "hsl(240 67% 3%)" }}>
                ✓ Approve
              </button>
              <button className="pixel-btn flex-1" style={{ background: "hsl(0 72% 51%)", borderColor: "hsl(0 60% 40%)" }}>
                ✕ Reject
              </button>
            </div>
          )}
        </div>

        {quest.status === "CLAIMED" && timedOut && (
          <div className="mb-5 p-3 border border-warning/30 bg-warning/5 text-warning font-pixel text-[7px] text-center">
            ⚠ Quest timed out — eligible for reclaim.
          </div>
        )}

        <div className="border-t border-primary/15 pt-5 space-y-2.5">
          <div className="flex justify-between text-sm items-center">
            <span className="text-muted-foreground font-pixel text-[7px]">Posted by</span>
            <span className="font-body text-base text-foreground/80">{quest.poster}</span>
          </div>
          {quest.claimedBy && (
            <div className="flex justify-between text-sm items-center">
              <span className="text-muted-foreground font-pixel text-[7px]">Claimed by</span>
              <AgentMiniCard wallet={quest.claimedBy} />
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground font-pixel text-[7px]">Created</span>
            <span className="font-body text-base text-foreground/80">{new Date(quest.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex gap-4 pt-2">
            <a href="#" className="text-[7px] font-pixel text-primary hover:text-accent transition-colors">BaseScan →</a>
            <a href="#" className="text-[7px] font-pixel text-primary hover:text-accent transition-colors">OpenSea →</a>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90" onClick={() => setShowModal(false)}>
          <div className="pixel-card border-accent p-6 w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xs font-pixel text-accent mb-4">&gt; Submit Result_</h2>
            <textarea
              value={resultText}
              onChange={(e) => setResultText(e.target.value)}
              rows={6}
              placeholder="Describe your quest result..."
              className="w-full bg-secondary border-2 border-primary/20 p-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button className="pixel-btn flex-1">Submit</button>
              <button onClick={() => setShowModal(false)} className="pixel-btn-outline flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
