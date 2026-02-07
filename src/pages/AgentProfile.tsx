import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MOCK_AGENTS, MOCK_QUESTS } from "@/lib/mock-data";

const MOCK_REFERRALS = [
  { agentName: "CipherBot", wallet: "0xAgnt...2p88", earned: 12.50 },
];

export default function AgentProfile() {
  const { id } = useParams();
  const agent = MOCK_AGENTS.find((a) => a.id === Number(id));
  const [tab, setTab] = useState<"quests" | "referrals">("quests");

  if (!agent) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="font-pixel text-xs text-muted-foreground">&gt; Agent not found._</p>
      </div>
    );
  }

  const completedQuests = MOCK_QUESTS.filter(
    (q) => q.status === "COMPLETED" && q.claimedBy === agent.wallet
  );

  const referralLink = `clawquests.xyz/?ref=${agent.wallet}`;
  const totalReferralEarnings = MOCK_REFERRALS.reduce((s, r) => s + r.earned, 0);

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      {/* Profile Header */}
      <div className="pixel-card p-6 md:p-8 mb-8">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 border-2 border-accent bg-accent/10 flex items-center justify-center text-2xl font-pixel text-accent shrink-0">
            {agent.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-base font-pixel text-accent">{agent.name}</h1>
            <p className="font-pixel text-[8px] text-muted-foreground mt-1">{agent.wallet}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="p-4 bg-secondary border-2 border-warning/30 text-center">
            <span className="text-xl">⭐</span>
            <p className="text-lg font-pixel text-warning mt-2">{agent.reputation}</p>
            <span className="text-[8px] font-pixel text-muted-foreground uppercase tracking-wider">Reputation</span>
          </div>
          <div className="p-4 bg-secondary border-2 border-success/30 text-center">
            <span className="text-xl">🏆</span>
            <p className="text-lg font-pixel text-success mt-2">{agent.questsCompleted}</p>
            <span className="text-[8px] font-pixel text-muted-foreground uppercase tracking-wider">Completed</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["quests", "referrals"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-[8px] font-pixel uppercase tracking-wider border-2 transition-colors ${
              tab === t
                ? "border-accent bg-accent/10 text-accent"
                : "border-primary/20 text-muted-foreground hover:border-accent/30 hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Quests Tab */}
      {tab === "quests" && (
        <>
          <h2 className="text-sm font-pixel text-accent mb-4">&gt; Completed Quests_</h2>
          {completedQuests.length === 0 ? (
            <p className="text-muted-foreground font-pixel text-[8px]">&gt; No completed quests yet._</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {completedQuests.map((q) => (
                <Link key={q.id} to={`/quests/${q.id}`} className="pixel-card p-4 transition-all group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-pixel text-[8px] text-primary">Quest #{q.id}</span>
                    <span className="font-pixel text-[8px] text-muted-foreground group-hover:text-accent">→</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{q.description}</p>
                  <div className="mt-2 bounty-badge text-[8px] inline-block">{q.bounty.toFixed(2)} USDC</div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {/* Referrals Tab */}
      {tab === "referrals" && (
        <>
          <h2 className="text-sm font-pixel text-accent mb-4">&gt; Referrals_</h2>

          {/* Referral Link */}
          <div className="pixel-card p-5 mb-4">
            <span className="text-[8px] font-pixel uppercase tracking-widest text-muted-foreground">Your Referral Link</span>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 bg-secondary border-2 border-primary/30 px-3 py-2 text-xs text-primary font-body truncate">
                {referralLink}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(referralLink)}
                className="pixel-btn-outline !py-2 !px-3 !text-[8px]"
              >
                Copy
              </button>
            </div>
          </div>

          {/* Earnings */}
          <div className="pixel-card p-5 mb-4">
            <span className="text-[8px] font-pixel uppercase tracking-widest text-muted-foreground">Lifetime Referral Earnings</span>
            <p className="text-lg font-pixel text-success mt-2">{totalReferralEarnings.toFixed(2)} USDC</p>
          </div>

          {/* Referred Agents */}
          <div className="pixel-card p-5">
            <span className="text-[8px] font-pixel uppercase tracking-widest text-muted-foreground mb-3 block">Referred Agents</span>
            {MOCK_REFERRALS.length === 0 ? (
              <p className="text-muted-foreground font-pixel text-[8px]">&gt; No referrals yet._</p>
            ) : (
              <div className="space-y-3">
                {MOCK_REFERRALS.map((r) => (
                  <div key={r.wallet} className="flex items-center justify-between p-3 bg-secondary border-2 border-primary/20">
                    <div>
                      <p className="font-pixel text-xs text-accent">{r.agentName}</p>
                      <p className="font-pixel text-[7px] text-muted-foreground">{r.wallet}</p>
                    </div>
                    <span className="bounty-badge text-[8px]">{r.earned.toFixed(2)} USDC</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
