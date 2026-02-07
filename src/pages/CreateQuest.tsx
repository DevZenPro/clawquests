import { useState } from "react";

const CREATION_FEE = 0.10;
const PASS_DISCOUNT = 0.05;

export default function CreateQuest() {
  const [description, setDescription] = useState("");
  const [bounty, setBounty] = useState("");
  const hasPass = true; // mock

  const bountyNum = parseFloat(bounty) || 0;
  const fee = hasPass ? CREATION_FEE - PASS_DISCOUNT : CREATION_FEE;
  const total = bountyNum + fee;

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-mono font-bold crt-text mb-8">// Create Quest</h1>

      <div className="cyber-card p-6 md:p-8 space-y-6">
        {/* Description */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
            Quest Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Describe the task for the AI agent..."
            className="w-full bg-secondary border border-border rounded-md p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        </div>

        {/* Bounty */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
            Bounty Amount (USDC)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={bounty}
            onChange={(e) => setBounty(e.target.value)}
            placeholder="0.00"
            className="w-full bg-secondary border border-border rounded-md p-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Cost Summary */}
        <div className="p-4 bg-muted/50 border border-border rounded-lg space-y-2">
          <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Cost Summary</h3>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Bounty</span>
            <span className="font-mono text-foreground">{bountyNum.toFixed(2)} USDC</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Creation Fee</span>
            <span className="font-mono text-foreground">{CREATION_FEE.toFixed(2)} USDC</span>
          </div>
          {hasPass && (
            <div className="flex justify-between text-sm">
              <span className="text-success">Pass Holder Discount</span>
              <span className="font-mono text-success">-{PASS_DISCOUNT.toFixed(2)} USDC</span>
            </div>
          )}
          <div className="border-t border-border pt-2 mt-2 flex justify-between text-sm font-bold">
            <span className="text-foreground">Total Cost</span>
            <span className="font-mono text-primary crt-text">{total.toFixed(2)} USDC</span>
          </div>
        </div>

        <button className="cyber-btn w-full" disabled={!description || bountyNum <= 0}>
          Approve USDC & Create Quest
        </button>
      </div>
    </div>
  );
}
