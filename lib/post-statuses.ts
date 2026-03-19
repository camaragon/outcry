export const POST_STATUSES = [
  "OPEN",
  "UNDER_REVIEW",
  "PLANNED",
  "IN_PROGRESS",
  "COMPLETE",
  "CLOSED",
] as const;

export type PostStatus = (typeof POST_STATUSES)[number];

export const STATUS_LABELS: Record<
  PostStatus,
  { label: string; variant: "default" | "secondary" | "outline"; className?: string }
> = {
  OPEN: { label: "Open", variant: "outline" },
  UNDER_REVIEW: { label: "Under Review", variant: "secondary" },
  PLANNED: { label: "Planned", variant: "secondary" },
  IN_PROGRESS: {
    label: "In Progress",
    variant: "secondary",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  COMPLETE: {
    label: "Complete",
    variant: "secondary",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  CLOSED: { label: "Closed", variant: "outline" },
};
