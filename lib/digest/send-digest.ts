import { resend, FROM_EMAIL } from "@/lib/resend";
import { db } from "@/lib/db";
import WeeklyDigestEmail, { buildDigestSubject } from "@/emails/weekly-digest";
import type { IntelligenceSnapshot } from "./types";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://outcry.app";

interface SendDigestOptions {
  snapshot: IntelligenceSnapshot;
  isDemo?: boolean;
}

/**
 * Send the weekly digest email to all admins/owners in the workspace.
 * Uses the IntelligenceSnapshot to render the email and build the subject line.
 */
export async function sendDigestEmail({
  snapshot,
  isDemo = false,
}: SendDigestOptions): Promise<void> {
  if (!resend) {
    console.warn("[digest-email] Resend not configured — skipping email send");
    return;
  }

  // Get workspace admins/owners to send the digest to
  const recipients = await db.user.findMany({
    where: {
      workspaceId: snapshot.workspaceId,
      role: { in: ["ADMIN", "OWNER"] },
    },
    select: { email: true },
  });

  if (recipients.length === 0) {
    console.warn(
      `[digest-email] No admin/owner recipients for workspace ${snapshot.workspaceId}`,
    );
    return;
  }

  // Build the workspace board URL
  const workspace = await db.workspace.findUnique({
    where: { id: snapshot.workspaceId },
    select: {
      slug: true,
      boards: { select: { slug: true }, take: 1 },
    },
  });

  const boardUrl = workspace?.boards[0]
    ? `${APP_URL}/b/${workspace.slug}/${workspace.boards[0].slug}`
    : `${APP_URL}/dashboard`;

  const settingsUrl = `${APP_URL}/dashboard/settings`;
  const subject = isDemo
    ? `Here's your first Outcry digest — this is what you'll get every week`
    : buildDigestSubject(snapshot);

  // Send to each recipient individually (Resend handles batching)
  const results = await Promise.allSettled(
    recipients.map((recipient) =>
      resend!.emails.send({
        from: FROM_EMAIL,
        to: recipient.email,
        subject,
        react: WeeklyDigestEmail({
          snapshot,
          boardUrl,
          settingsUrl,
          isDemo,
        }),
      }),
    ),
  );

  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length > 0) {
    console.error(
      `[digest-email] Failed to send ${failed.length}/${recipients.length} digest emails`,
      failed.map((f) => (f as PromiseRejectedResult).reason),
    );
  } else {
    console.log(
      `[digest-email] Sent digest to ${recipients.length} recipients for workspace ${snapshot.workspaceId}`,
    );
  }
}
