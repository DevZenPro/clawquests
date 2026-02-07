import { useState } from "react";
import { Link } from "react-router-dom";
import { useReadContract, useReadContracts } from "wagmi";
import { getContracts, formatUSDC, QuestStatus, getQuestStatusLabel } from "@/lib/blockchain/client";

const contracts = getContracts();

const STATUS_FILTERS = ["ALL", "OPEN", "CLAIMED", "PENDING_REVIEW", "COMPLETED"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const SORTS = ["Newest", "Highest Bounty"] as const;

export default function Quests() {
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Newest");

  // Fetch open quest IDs
  const { data: openQuestIds, isLoading: idsLoading } = useReadContract({
    address: contracts.clawQuests.address,
    abi: contracts.clawQuests.abi,
    functionName: 'getOpenQuests',
  });

  // Also fetch totalQuests to get all quest IDs (not just open)
  const { data: totalQuests } = useReadContract({
    address: contracts.clawQuests.address,
    abi: contracts.clawQuests.abi,
    functionName: 'totalQuests',
  });

  // Build array of all quest IDs to fetch details for
  const allQuestIds: bigint[] = [];
  if (totalQuests) {
    for (let i = BigInt(0); i < totalQuests; i++) {
      allQuestIds.push(i);
    }
  }

  // Batch fetch quest details for all IDs
  const { data: questResults, isLoading: detailsLoading } = useReadContracts({
    contracts: allQuestIds.map((id) => ({
      address: contracts.clawQuests.address,
      abi: contracts.clawQuests.abi,
      functionName: 'getQuest' as const,
      args: [id] as const,
    })),
  });

  // Parse quest data
  const quests = (questResults || [])
    .map((result, index) => {
      if (result.status !== 'success' || !result.result) return null;
      const [creator, claimer, title, description, bountyAmount, status, createdAt, claimedAt, deadline] =
        result.result as [string, string, string, string, bigint, number, bigint, bigint, bigint];
      return {
        id: allQuestIds[index],
        creator,
        claimer,
        title,
        description,
        bountyAmount,
        status: status as QuestStatus,
        createdAt,
        claimedAt,
        deadline,
      };
    })
    .filter(Boolean);

  // Filter
  const statusMap: Record<string, QuestStatus> = {
    OPEN: QuestStatus.OPEN,
    CLAIMED: QuestStatus.CLAIMED,
    PENDING_REVIEW: QuestStatus.PENDING_REVIEW,
    COMPLETED: QuestStatus.COMPLETED,
  };

  const filtered = quests
    .filter((q) => filter === "ALL" || q.status === statusMap[filter])
    .sort((a, b) => {
      if (sort === "Highest Bounty") return Number(b.bountyAmount - a.bountyAmount);
      return Number(b.id - a.id);
    });

  const isLoading = idsLoading || detailsLoading;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-lg font-pixel text-accent mb-8">&gt; Open Quests_</h1>

      {/* Status Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-[8px] font-pixel uppercase tracking-wider transition-colors border-2 ${
              filter === f
                ? "border-accent bg-accent/10 text-accent"
                : "border-primary/20 text-muted-foreground hover:border-accent/40 hover:text-foreground"
            }`}
          >
            {f === "PENDING_REVIEW" ? "REVIEW" : f}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-3">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="bg-secondary border-2 border-primary/30 px-3 py-2 text-xs font-body text-foreground focus:outline-none focus:border-accent"
          >
            {SORTS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {isLoading && (
        <p className="text-center text-muted-foreground font-pixel text-xs py-20">&gt; Loading quests..._</p>
      )}

      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((q) => (
            <div key={q.id.toString()} className="pixel-card p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-pixel text-[8px] text-muted-foreground">Quest #{q.id.toString()}</span>
                <span className={`px-2.5 py-0.5 text-[8px] font-pixel uppercase tracking-wider ${
                  q.status === QuestStatus.OPEN ? "status-open" :
                  q.status === QuestStatus.CLAIMED ? "status-claimed" :
                  q.status === QuestStatus.PENDING_REVIEW ? "status-pending" :
                  "status-completed"
                }`}>
                  {getQuestStatusLabel(q.status)}
                </span>
              </div>
              <p className="text-sm text-foreground line-clamp-3 leading-relaxed flex-1">
                {q.title || q.description}
              </p>
              <div className="flex items-center justify-between mt-auto pt-3 border-t-2 border-primary/20">
                <span className="bounty-badge text-[8px]">{formatUSDC(q.bountyAmount)} USDC</span>
                <span className="text-[8px] font-pixel text-muted-foreground">
                  by {q.creator.slice(0, 6)}...{q.creator.slice(-4)}
                </span>
              </div>
              <Link to={`/quests/${q.id.toString()}`} className="pixel-btn-outline !py-2 !text-[8px] text-center flex items-center justify-center gap-2">
                View Quest &rarr;
              </Link>
            </div>
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <p className="text-center text-muted-foreground font-pixel text-xs py-20">&gt; No quests found._</p>
      )}
    </div>
  );
}
