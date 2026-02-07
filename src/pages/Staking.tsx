import { useState } from "react";
import { MOCK_USER_STAKE } from "@/lib/mock-data";

const MIN_STAKE = 10;

export default function Staking() {
  const [amount, setAmount] = useState("");
  const currentStake = MOCK_USER_STAKE;
  const meetsMinimum = currentStake >= MIN_STAKE;

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <h1 className="text-sm font-pixel text-accent mb-2">&gt; Staking_</h1>
      <p className="text-lg text-muted-foreground mb-8">
        A minimum stake of {MIN_STAKE.toFixed(2)} USDC is required to create quests.
      </p>

      <div className="pixel-card p-6 md:p-8 mb-5">
        <h2 className="text-[7px] font-pixel uppercase tracking-widest text-muted-foreground mb-4">Your Stake</h2>
        <p className="text-xl font-pixel text-accent mb-3">{currentStake.toFixed(2)} USDC</p>
        <div className="flex items-center gap-2">
          <span className="text-sm font-body text-muted-foreground">Minimum: {MIN_STAKE.toFixed(2)} USDC</span>
          {meetsMinimum ? (
            <span className="text-sm font-body text-success">✅ Met</span>
          ) : (
            <span className="text-sm font-body text-destructive">❌ Not met</span>
          )}
        </div>
      </div>

      <div className="pixel-card p-6 md:p-8">
        <h2 className="text-[7px] font-pixel uppercase tracking-widest text-muted-foreground mb-4">Manage Stake</h2>
        <div className="mb-4">
          <label className="block text-[7px] font-pixel uppercase tracking-widest text-muted-foreground mb-2">
            Amount (USDC)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-secondary border-2 border-primary/20 p-3 text-base font-pixel text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
          />
        </div>
        <div className="flex gap-3">
          <button className="pixel-btn flex-1" disabled={!amount || parseFloat(amount) <= 0}>
            Stake
          </button>
          <button className="pixel-btn-outline flex-1" disabled={!amount || parseFloat(amount) <= 0}>
            Unstake
          </button>
        </div>
      </div>
    </div>
  );
}
