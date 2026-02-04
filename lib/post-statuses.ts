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
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  OPEN: { label: "Open", variant: "outline" },
  UNDER_REVIEW: { label: "Under Review", variant: "secondary" },
  PLANNED: { label: "Planned", variant: "secondary" },
  IN_PROGRESS: { label: "In Progress", variant: "default" },
  COMPLETE: { label: "Complete", variant: "default" },
  CLOSED: { label: "Closed", variant: "outline" },
};
