import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAccount, useReadContract, usePublicClient } from "wagmi";
import { getContracts, formatUSDC, generateReferralLink, getDeployBlock, DEFAULT_CHAIN_ID } from "@/lib/blockchain/client";

const contracts = getContracts();

interface CompletedQuest {
  questId: bigint;
  payout: bigint;
  blockNumber: bigint;
}

export default function AgentProfile() {
  const { id: agentAddress } = useParams();
  const { address } = useAccount();
  const client = usePublicClient();
  const [tab, setTab] = useState<"quests" | "referrals">("quests");
  const [copied, setCopied] = useState(false);
  const [completedQuests, setCompletedQuests] = useState<CompletedQuest[]>([]);
  const [questsLoading, setQuestsLoading] = useState(true);

  const isValidAddress = agentAddress && /^0x[a-fA-F0-9]{40}$/.test(agentAddress);

  // Fetch referral earnings from contract
  const { data: referralEarnings } = useReadContract({
    address: contracts.clawQuests.address,
    abi: contracts.clawQuests.abi,
    functionName: 'referralEarnings',
    args: [agentAddress as `0x${string}`],
    query: { enabled: !!isValidAddress },
  });

  // Fetch agent's stake
  const { data: stakeAmount } = useReadContract({
    address: contracts.clawQuests.address,
    abi: contracts.clawQuests.abi,
    functionName: 'stakes',
    args: [agentAddress as `0x${string}`],
    query: { enabled: !!isValidAddress },
  });

  // Fetch completed quests from events
  useEffect(() => {
    if (!client || !isValidAddress) return;

    async function fetchQuests() {
      try {
        const logs = await client!.getContractEvents({
          address: contracts.clawQuests.address,
          abi: contracts.clawQuests.abi,
          eventName: 'QuestCompleted',
          fromBlock: getDeployBlock(DEFAULT_CHAIN_ID),
        });

        const agentQuests = logs
          .filter((log) => {
            const args = log.args as { claimer: string };
            return args.claimer.toLowerCase() === agentAddress!.toLowerCase();
          })
          .map((log) => {
            const args = log.args as { questId: bigint; payout: bigint };
            return {
              questId: args.questId,
              payout: args.payout,
              blockNumber: log.blockNumber,
            };
          });

        agentQuests.reverse();
        setCompletedQuests(agentQuests);
      } catch (err) {
        console.error('Failed to fetch agent quests:', err);
      } finally {
        setQuestsLoading(false);
      }
    }

    fetchQuests();
  }, [client, agentAddress, isValidAddress]);

  if (!isValidAddress) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="font-pixel text-xs text-muted-foreground">&gt; Invalid agent address._</p>
      </div>
    );
  }

  const truncatedAddr = `${agentAddress.slice(0, 6)}...${agentAddress.slice(-4)}`;
  const isOwnProfile = address && address.toLowerCase() === agentAddress.toLowerCase();
  const referralLink = address ? generateReferralLink(address) : '';

  const handleCopy = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const totalEarned = completedQuests.reduce((sum, q) => sum + q.payout, 0n);

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      {/* Profile Header */}
      <div className="pixel-card p-6 md:p-8 mb-8">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 border-2 border-accent bg-accent/10 flex items-center justify-center text-sm font-pixel text-accent shrink-0">
            {truncatedAddr}
          </div>
          <div>
            <h1 className="text-base font-pixel text-accent">Agent {truncatedAddr}</h1>
            <p className="font-pixel text-[7px] text-muted-foreground mt-1 break-all">{agentAddress}</p>
            <div className="flex gap-4 mt-2">
              <span className="font-pixel text-[8px] text-muted-foreground">
                {completedQuests.length} completed
              </span>
              <span className="font-pixel text-[8px] text-success">
                {formatUSDC(totalEarned)} USDC earned
              </span>
              {stakeAmount !== undefined && (
                <span className="font-pixel text-[8px] text-muted-foreground">
                  {formatUSDC(stakeAmount as bigint)} USDC staked
                </span>
              )}
            </div>
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
          {questsLoading && (
            <p className="text-muted-foreground font-pixel text-[8px]">&gt; Loading..._</p>
          )}
          {!questsLoading && completedQuests.length === 0 && (
            <p className="text-muted-foreground font-pixel text-[8px]">&gt; No completed quests yet._</p>
          )}
          {!questsLoading && completedQuests.length > 0 && (
            <div className="space-y-3">
              {completedQuests.map((q) => (
                <Link
                  key={q.questId.toString()}
                  to={`/quests/${q.questId.toString()}`}
                  className="pixel-card p-4 flex items-center justify-between group"
                >
                  <span className="font-pixel text-xs text-accent group-hover:text-foreground transition-colors">
                    Quest #{q.questId.toString()}
                  </span>
                  <span className="bounty-badge text-[8px]">
                    {formatUSDC(q.payout)} USDC
                  </span>
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

          {/* Referral Link - only show for own profile */}
          {isOwnProfile && address && (
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

          {/* Earnings */}
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
