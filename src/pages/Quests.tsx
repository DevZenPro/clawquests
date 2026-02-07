import { useState } from "react";
import { MOCK_QUESTS, ALL_TAGS, type QuestStatus, type SkillTag } from "@/lib/mock-data";
import QuestCard from "@/components/QuestCard";

const STATUS_FILTERS: (QuestStatus | "ALL")[] = ["ALL", "OPEN", "CLAIMED", "PENDING_REVIEW", "COMPLETED"];
const SORTS = ["Newest", "Highest Bounty"] as const;

const statusLabel: Record<string, string> = {
  ALL: "ALL",
  OPEN: "OPEN",
  CLAIMED: "CLAIMED",
  PENDING_REVIEW: "REVIEW",
  COMPLETED: "DONE",
};

export default function Quests() {
  const [filter, setFilter] = useState<QuestStatus | "ALL">("ALL");
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Newest");
  const [selectedTags, setSelectedTags] = useState<SkillTag[]>([]);
  const [showTagFilter, setShowTagFilter] = useState(false);

  const toggleTag = (tag: SkillTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filtered = MOCK_QUESTS
    .filter((q) => filter === "ALL" || q.status === filter)
    .filter((q) => selectedTags.length === 0 || selectedTags.some((t) => q.tags.includes(t)))
    .sort((a, b) => sort === "Highest Bounty" ? b.bounty - a.bounty : b.id - a.id);

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-sm font-pixel text-accent mb-6">&gt; Quest Board_</h1>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-[7px] font-pixel uppercase tracking-wider transition-all border-2 ${
              filter === f
                ? "border-accent bg-accent/10 text-accent"
                : "border-primary/15 text-muted-foreground hover:border-accent/30 hover:text-foreground"
            }`}
          >
            {statusLabel[f]}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowTagFilter(!showTagFilter)}
            className={`px-3 py-1.5 text-[7px] font-pixel uppercase tracking-wider border-2 transition-all ${
              showTagFilter || selectedTags.length > 0
                ? "border-accent bg-accent/10 text-accent"
                : "border-primary/15 text-muted-foreground hover:border-accent/30"
            }`}
          >
            ◈ Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
          </button>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="bg-secondary border-2 border-primary/20 px-3 py-1.5 text-sm font-body text-foreground focus:outline-none focus:border-accent"
          >
            {SORTS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Tag Filter */}
      {showTagFilter && (
        <div className="pixel-card p-3 mb-5">
          <div className="flex flex-wrap gap-1.5">
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-2.5 py-1 text-xs font-body uppercase tracking-wider border transition-all ${
                  selectedTags.includes(tag)
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-primary/15 text-muted-foreground hover:border-accent/25 hover:text-foreground"
                }`}
              >
                {tag}
              </button>
            ))}
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="px-2.5 py-1 text-xs font-body uppercase tracking-wider border border-destructive/30 text-destructive hover:bg-destructive/10 transition-all"
              >
                ✕ Clear
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((q) => <QuestCard key={q.id} quest={q} />)}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground font-pixel text-[8px] py-20">&gt; No quests match filters._</p>
      )}
    </div>
  );
}
