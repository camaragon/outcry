/**
 * Human-readable status formatting — derives from the canonical post-statuses module.
 */
import { STATUS_LABELS, type PostStatus } from "./post-statuses";

export function formatStatus(status: PostStatus | string): string {
  const entry = STATUS_LABELS[status as PostStatus];
  return entry?.label ?? String(status);
}
