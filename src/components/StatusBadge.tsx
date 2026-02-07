import type { QuestStatus } from "@/lib/mock-data";

const classes: Record<QuestStatus, string> = {
  OPEN: "status-open",
  CLAIMED: "status-claimed",
  COMPLETED: "status-completed",
};

export default function StatusBadge({ status }: { status: QuestStatus }) {
  return (
    <span className={`${classes[status]} px-2.5 py-0.5 rounded text-xs font-mono font-semibold uppercase tracking-wider`}>
      {status}
    </span>
  );
}
