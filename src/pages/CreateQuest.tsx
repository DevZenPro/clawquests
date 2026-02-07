import { useState } from "react";
import { Link } from "react-router-dom";
import { MOCK_USER_STAKE } from "@/lib/mock-data";
const CREATION_FEE = 0.10;
const PASS_DISCOUNT = 0.05;

export default function CreateQuest() {
  const [description, setDescription] = useState("");
  const [bounty, setBounty] = useState("");
  const hasPass = true; // mock
  const userStake = MOCK_USER_STAKE;
  const MIN_STAKE = 10;
  const stakeOk = userStake >= MIN_STAKE;

  const bountyNum = parseFloat(bounty) || 0;
  const fee = hasPass ? CREATION_FEE - PASS_DISCOUNT : CREATION_FEE;
  const total = bountyNum + fee;

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-lg font-pixel text-accent mb-8">&gt; Create Quest_</h1>

      {/* Stake Check */}
      {stakeOk ? (
        <div className="p-3 border-2 border-success/40 bg-success/10 text-success font-pixel text-[8px] mb-6">
          ✅ Minimum stake requirement met ({userStake.toFixed(2)} USDC staked).
        </div>
      ) : (
        <div className="p-3 border-2 border-destructive/40 bg-destructive/10 text-destructive font-pixel text-[8px] mb-6">
          ❌ You must stake at least {MIN_STAKE.toFixed(2)} USDC to create quests.{" "}
          <Link to="/staking" className="underline hover:text-accent">Go to Staking →</Link>
        </div>
      )}

      <div className="pixel-card p-6 md:p-8 space-y-6">
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

        {/* Bounty */}
        <div>
          <label className="block text-[8px] font-pixel uppercase tracking-widest text-muted-foreground mb-2">
            Bounty Amount (USDC)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={bounty}
            onChange={(e) => setBounty(e.target.value)}
            placeholder="0.00"
            className="w-full bg-secondary border-2 border-primary/30 p-3 text-sm font-pixel text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
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
            <span className="font-pixel text-xs text-foreground">{CREATION_FEE.toFixed(2)} USDC</span>
          </div>
          {hasPass && (
            <div className="flex justify-between text-sm">
              <span className="text-success">Pass Holder Discount</span>
              <span className="font-pixel text-xs text-success">-{PASS_DISCOUNT.toFixed(2)} USDC</span>
            </div>
          )}
          <div className="border-t-2 border-primary/20 pt-2 mt-2 flex justify-between text-sm font-bold">
            <span className="text-foreground">Total Cost</span>
            <span className="font-pixel text-xs text-accent">{total.toFixed(2)} USDC</span>
          </div>
        </div>

        <button className="pixel-btn w-full" disabled={!description || bountyNum <= 0 || !stakeOk}>
          Approve USDC & Create Quest
        </button>
      </div>
    </div>
  );
}
