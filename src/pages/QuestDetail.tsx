import { useParams, Link } from "react-router-dom";
import { MOCK_QUESTS } from "@/lib/mock-data";
import StatusBadge from "@/components/StatusBadge";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useState } from "react";

export default function QuestDetail() {
  const { id } = useParams();
  const quest = MOCK_QUESTS.find((q) => q.id === Number(id));
  const [showModal, setShowModal] = useState(false);
  const [resultText, setResultText] = useState("");

  if (!quest) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="font-mono text-muted-foreground">Quest not found.</p>
        <Link to="/quests" className="cyber-btn-outline !py-2 mt-4 inline-block">Back to Quests</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Link to="/quests" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
        <ArrowLeft className="h-4 w-4" /> Back to Quests
      </Link>

      <div className="cyber-card p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-mono font-bold crt-text">Quest #{quest.id}</h1>
          <StatusBadge status={quest.status} />
        </div>

        {/* Bounty */}
        <div className="bounty-badge text-lg inline-block mb-6 crt-green">
          {quest.bounty.toFixed(2)} USDC
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Description</h3>
          <p className="text-foreground leading-relaxed">{quest.description}</p>
        </div>

        {/* Result */}
        {quest.result && (
          <div className="mb-6 p-4 bg-success/5 border border-success/20 rounded-lg">
            <h3 className="text-xs font-mono uppercase tracking-widest text-success mb-2">Result</h3>
            <p className="text-sm text-foreground leading-relaxed font-mono">{quest.result}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mb-6">
          {quest.status === "OPEN" && (
            <button className="cyber-btn w-full">Claim Quest</button>
          )}
          {quest.status === "CLAIMED" && (
            <button onClick={() => setShowModal(true)} className="cyber-btn w-full">
              Complete Quest
            </button>
          )}
        </div>

        {/* Details */}
        <div className="border-t border-border pt-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground font-mono">Posted by</span>
            <span className="font-mono text-foreground">{quest.poster}</span>
          </div>
          {quest.claimedBy && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground font-mono">Claimed by</span>
              <span className="font-mono text-primary">{quest.claimedBy}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground font-mono">Created</span>
            <span className="font-mono text-foreground">{new Date(quest.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex gap-4 pt-3">
            <a href="#" className="inline-flex items-center gap-1 text-xs font-mono text-primary hover:underline">
              View on BaseScan <ExternalLink className="h-3 w-3" />
            </a>
            <a href="#" className="inline-flex items-center gap-1 text-xs font-mono text-primary hover:underline">
              View NFT on OpenSea <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Complete Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="cyber-card cyber-border-glow p-6 w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-mono font-bold crt-text mb-4">Submit Result</h2>
            <textarea
              value={resultText}
              onChange={(e) => setResultText(e.target.value)}
              rows={6}
              placeholder="Describe your quest result..."
              className="w-full bg-secondary border border-border rounded-md p-3 text-sm text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button className="cyber-btn flex-1">Submit</button>
              <button onClick={() => setShowModal(false)} className="cyber-btn-outline flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
