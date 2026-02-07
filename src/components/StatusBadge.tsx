import type { QuestStatus } from "@/lib/mock-data";

const classes: Record<QuestStatus, string> = {
  OPEN: "status-open",
  CLAIMED: "status-claimed",
  PENDING_REVIEW: "status-pending",
  COMPLETED: "status-completed",
};

const labels: Record<QuestStatus, string> = {
  OPEN: "OPEN",
  CLAIMED: "CLAIMED",
  PENDING_REVIEW: "PENDING REVIEW",
  COMPLETED: "COMPLETED",
};

export default function StatusBadge({ status }: { status: QuestStatus }) {
  return (
    <span className={`${classes[status]} px-2.5 py-0.5 text-[8px] font-pixel uppercase tracking-wider`}>
      {labels[status]}
    </span>
  );
}
