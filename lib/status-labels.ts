/**
 * Human-readable labels for post statuses.
 * Single source of truth — used in notifications and email templates.
 */
export const STATUS_LABELS: Record<string, string> = {
  OPEN: "Open",
  UNDER_REVIEW: "Under Review",
  PLANNED: "Planned",
  IN_PROGRESS: "In Progress",
  COMPLETE: "Complete",
  CLOSED: "Closed",
};

export function formatStatus(status: string): string {
  return STATUS_LABELS[status] || status;
}
