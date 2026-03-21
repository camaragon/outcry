import { resend, FROM_EMAIL } from "@/lib/resend";
import { db } from "@/lib/db";
import { sanitizeSubject } from "@/lib/notifications";
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
  const emailClient = resend;

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

  // Build the workspace board URL from the boards included in this digest
  const workspace = await db.workspace.findUnique({
    where: { id: snapshot.workspaceId },
    select: {
      slug: true,
      boards: {
        where: { id: { in: snapshot.boardIds } },
        select: { slug: true },
        take: 1,
      },
    },
  });

  const boardUrl =
    workspace?.boards[0]?.slug && workspace.slug
      ? `${APP_URL}/b/${workspace.slug}/${workspace.boards[0].slug}`
      : workspace?.slug
        ? `${APP_URL}/dashboard`
        : `${APP_URL}/dashboard`;

  const settingsUrl = `${APP_URL}/dashboard/settings`;
  const rawSubject = isDemo
    ? `Here's your first Outcry digest — this is what you'll get every week`
    : buildDigestSubject(snapshot);
  const subject = sanitizeSubject(rawSubject);

  // Send to each recipient individually (Resend handles batching)
  const results = await Promise.allSettled(
    recipients.map((recipient) =>
      emailClient.emails.send({
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
