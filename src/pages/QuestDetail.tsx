import { useParams, Link } from "react-router-dom";
import { MOCK_QUESTS } from "@/lib/mock-data";
import StatusBadge from "@/components/StatusBadge";
import { useState } from "react";

export default function QuestDetail() {
  const { id } = useParams();
  const quest = MOCK_QUESTS.find((q) => q.id === Number(id));
  const [showModal, setShowModal] = useState(false);
  const [resultText, setResultText] = useState("");

  if (!quest) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="font-pixel text-xs text-muted-foreground">&gt; Quest not found._</p>
        <Link to="/quests" className="pixel-btn-outline !py-2 mt-4 inline-block !text-[8px]">Back to Quests</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Link to="/quests" className="inline-flex items-center gap-2 text-xs font-pixel text-muted-foreground hover:text-accent transition-colors mb-8">
        ← Back to Quests
      </Link>

      <div className="pixel-card p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-base font-pixel text-accent">Quest #{quest.id}</h1>
          <StatusBadge status={quest.status} />
        </div>

        {/* Bounty */}
        <div className="bounty-badge text-sm inline-block mb-6">
          {quest.bounty.toFixed(2)} USDC
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="text-[8px] font-pixel uppercase tracking-widest text-muted-foreground mb-2">Description</h3>
          <p className="text-foreground leading-relaxed">{quest.description}</p>
        </div>

        {/* Result */}
        {quest.result && (
          <div className="mb-6 p-4 bg-success/5 border-2 border-success/30">
            <h3 className="text-[8px] font-pixel uppercase tracking-widest text-success mb-2">Result</h3>
            <p className="text-sm text-foreground leading-relaxed font-body">{quest.result}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mb-6">
          {quest.status === "OPEN" && (
            <button className="pixel-btn w-full">Claim Quest</button>
          )}
          {quest.status === "CLAIMED" && (
            <button onClick={() => setShowModal(true)} className="pixel-btn w-full">
              Complete Quest
            </button>
          )}
        </div>

        {/* Details */}
        <div className="border-t-2 border-primary/20 pt-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground font-pixel text-[8px]">Posted by</span>
            <span className="font-pixel text-[8px] text-foreground">{quest.poster}</span>
          </div>
          {quest.claimedBy && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground font-pixel text-[8px]">Claimed by</span>
              <span className="font-pixel text-[8px] text-accent">{quest.claimedBy}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground font-pixel text-[8px]">Created</span>
            <span className="font-pixel text-[8px] text-foreground">{new Date(quest.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex gap-4 pt-3">
            <a href="#" className="inline-flex items-center gap-1 text-[8px] font-pixel text-primary hover:text-accent transition-colors">
              BaseScan →
            </a>
            <a href="#" className="inline-flex items-center gap-1 text-[8px] font-pixel text-primary hover:text-accent transition-colors">
              OpenSea →
            </a>
          </div>
        </div>
      </div>

      {/* Complete Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90" onClick={() => setShowModal(false)}>
          <div className="pixel-card border-accent p-6 w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-sm font-pixel text-accent mb-4">&gt; Submit Result_</h2>
            <textarea
              value={resultText}
              onChange={(e) => setResultText(e.target.value)}
              rows={6}
              placeholder="Describe your quest result..."
              className="w-full bg-secondary border-2 border-primary/30 p-3 text-sm text-foreground font-body placeholder:text-muted-foreground focus:outline-none focus:border-accent resize-none"
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
