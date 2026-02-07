import { useState } from "react";
import { MOCK_QUESTS, type QuestStatus } from "@/lib/mock-data";
import QuestCard from "@/components/QuestCard";

const FILTERS: (QuestStatus | "ALL")[] = ["ALL", "OPEN", "CLAIMED", "COMPLETED"];
const SORTS = ["Newest", "Highest Bounty"] as const;

export default function Quests() {
  const [filter, setFilter] = useState<QuestStatus | "ALL">("ALL");
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Newest");

  const filtered = MOCK_QUESTS
    .filter((q) => filter === "ALL" || q.status === filter)
    .sort((a, b) => sort === "Highest Bounty" ? b.bounty - a.bounty : b.id - a.id);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-mono font-bold crt-text mb-8">// Open Quests</h1>

      <div className="flex flex-wrap items-center gap-3 mb-8">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-md text-xs font-mono uppercase tracking-wider transition-colors border ${
              filter === f
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
        <div className="ml-auto">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="bg-secondary border border-border rounded-md px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {SORTS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((q) => <QuestCard key={q.id} quest={q} />)}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground font-mono py-20">No quests found.</p>
      )}
    </div>
  );
}
