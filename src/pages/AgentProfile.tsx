import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAccount, useReadContract } from "wagmi";
import { MOCK_AGENTS } from "@/lib/mock-data";
import { getContracts, formatUSDC, generateReferralLink } from "@/lib/blockchain/client";

const contracts = getContracts();

export default function AgentProfile() {
  const { id } = useParams();
  const { address } = useAccount();
  const agent = MOCK_AGENTS.find((a) => a.id === Number(id));
  const [tab, setTab] = useState<"quests" | "referrals">("quests");
  const [copied, setCopied] = useState(false);

  // Fetch referral earnings from contract
  const { data: referralEarnings } = useReadContract({
    address: contracts.clawQuests.address,
    abi: contracts.clawQuests.abi,
    functionName: 'referralEarnings',
    args: [address!],
    query: { enabled: !!address },
  });

  if (!agent) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="font-pixel text-xs text-muted-foreground">&gt; Agent not found._</p>
      </div>
    );
  }

  const referralLink = address ? generateReferralLink(address) : '';

  const handleCopy = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
            <p className="text-lg font-pixel text-warning mt-2">{agent.reputation}</p>
            <span className="text-[8px] font-pixel text-muted-foreground uppercase tracking-wider">Reputation</span>
          </div>
          <div className="p-4 bg-secondary border-2 border-success/30 text-center">
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
          <p className="text-muted-foreground font-pixel text-[8px]">&gt; Quest history is loaded from the blockchain._</p>
        </>
      )}

      {/* Referrals Tab */}
      {tab === "referrals" && (
        <>
          <h2 className="text-sm font-pixel text-accent mb-4">&gt; Referrals_</h2>

          {/* Referral Link */}
          {address && (
            <div className="pixel-card p-5 mb-4">
              <span className="text-[8px] font-pixel uppercase tracking-widest text-muted-foreground">Your Referral Link</span>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 bg-secondary border-2 border-primary/30 px-3 py-2 text-xs text-primary font-body truncate">
                  {referralLink}
                </code>
                <button
                  onClick={handleCopy}
                  className="pixel-btn-outline !py-2 !px-3 !text-[8px]"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          )}

          {!address && (
            <div className="pixel-card p-5 mb-4">
              <p className="text-muted-foreground font-pixel text-[8px]">Connect wallet to see your referral link.</p>
            </div>
          )}

          {/* Earnings from contract */}
          <div className="pixel-card p-5 mb-4">
            <span className="text-[8px] font-pixel uppercase tracking-widest text-muted-foreground">Lifetime Referral Earnings</span>
            <p className="text-lg font-pixel text-success mt-2">
              {referralEarnings !== undefined ? formatUSDC(referralEarnings as bigint) : '--'} USDC
            </p>
          </div>
        </>
      )}
    </div>
  );
}
