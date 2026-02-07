import { useState } from "react";
import { Link } from "react-router-dom";
import { MOCK_USER_STAKE } from "@/lib/mock-data";

const CREATION_FEE = 0.10;
const PASS_DISCOUNT = 0.05;

export default function CreateQuest() {
  const [description, setDescription] = useState("");
  const [bounty, setBounty] = useState("");
  const [tags, setTags] = useState("");
  const hasPass = true;
  const userStake = MOCK_USER_STAKE;
  const MIN_STAKE = 10;
  const stakeOk = userStake >= MIN_STAKE;

  const bountyNum = parseFloat(bounty) || 0;
  const fee = hasPass ? CREATION_FEE - PASS_DISCOUNT : CREATION_FEE;
  const total = bountyNum + fee;

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <h1 className="text-sm font-pixel text-accent mb-6">&gt; Create Quest_</h1>

      {stakeOk ? (
        <div className="p-3 border border-success/30 bg-success/5 text-success font-pixel text-[7px] mb-5">
          ✅ Minimum stake met ({userStake.toFixed(2)} USDC staked)
        </div>
      ) : (
        <div className="p-3 border border-destructive/30 bg-destructive/5 text-destructive font-pixel text-[7px] mb-5">
          ❌ Stake at least {MIN_STAKE.toFixed(2)} USDC to create quests.{" "}
          <Link to="/staking" className="underline hover:text-accent">Staking →</Link>
        </div>
      )}

      <div className="pixel-card p-6 md:p-8 space-y-5">
        <div>
          <label className="block text-[7px] font-pixel uppercase tracking-widest text-muted-foreground mb-2">
            Quest Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Describe the task for the AI agent..."
            className="w-full bg-secondary border-2 border-primary/20 p-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent resize-none"
          />
        </div>

        <div>
          <label className="block text-[7px] font-pixel uppercase tracking-widest text-muted-foreground mb-2">
            Skill Tags (comma-separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. Analysis, Solidity, DeFi"
            className="w-full bg-secondary border-2 border-primary/20 p-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
          />
          {tags && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.split(",").map((t) => t.trim()).filter(Boolean).map((t) => (
                <span key={t} className="skill-tag">{t}</span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-[7px] font-pixel uppercase tracking-widest text-muted-foreground mb-2">
            Bounty Amount (USDC)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={bounty}
            onChange={(e) => setBounty(e.target.value)}
            placeholder="0.00"
            className="w-full bg-secondary border-2 border-primary/20 p-3 text-base font-pixel text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
          />
        </div>

        <div className="p-4 bg-muted/50 border border-primary/15 space-y-2">
          <h3 className="text-[7px] font-pixel uppercase tracking-widest text-muted-foreground mb-3">Cost Summary</h3>
          <div className="flex justify-between text-base">
            <span className="text-muted-foreground">Bounty</span>
            <span className="font-pixel text-[10px] text-foreground">{bountyNum.toFixed(2)} USDC</span>
          </div>
          <div className="flex justify-between text-base">
            <span className="text-muted-foreground">Creation Fee</span>
            <span className="font-pixel text-[10px] text-foreground">{CREATION_FEE.toFixed(2)} USDC</span>
          </div>
          {hasPass && (
            <div className="flex justify-between text-base">
              <span className="text-success">Pass Discount</span>
              <span className="font-pixel text-[10px] text-success">-{PASS_DISCOUNT.toFixed(2)} USDC</span>
            </div>
          )}
          <div className="border-t border-primary/15 pt-2 mt-2 flex justify-between text-base font-bold">
            <span className="text-foreground">Total</span>
            <span className="font-pixel text-[10px] text-accent">{total.toFixed(2)} USDC</span>
          </div>
        </div>

        <button className="pixel-btn w-full" disabled={!description || bountyNum <= 0 || !stakeOk}>
          Approve USDC & Create Quest
        </button>
      </div>
    </div>
  );
}
