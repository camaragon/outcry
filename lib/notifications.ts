import { resend, FROM_EMAIL } from "./resend";
import StatusChangeEmail from "@/emails/status-change";
import NewFeedbackEmail from "@/emails/new-feedback";
import { db } from "./db";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://outcry.app";

interface NotifyStatusChangeParams {
  postId: string;
  oldStatus: string;
  newStatus: string;
}

/**
 * Notify the post author when their feedback status changes
 */
export async function notifyStatusChange({
  postId,
  oldStatus,
  newStatus,
}: NotifyStatusChangeParams) {
  // Skip if status didn't actually change
  if (oldStatus === newStatus) return;

  try {
    const post = await db.post.findUnique({
      where: { id: postId },
      include: {
        author: true,
        board: {
          include: {
            workspace: true,
          },
        },
      },
    });

    if (!post || !post.author.email) return;

    const postUrl = `${APP_URL}/b/${post.board.workspace.slug}/${post.board.slug}/${post.id}`;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: post.author.email,
      subject: `Your feedback is now ${formatStatus(newStatus)}`,
      react: StatusChangeEmail({
        userName: post.author.name || "there",
        postTitle: post.title,
        oldStatus,
        newStatus,
        postUrl,
        workspaceName: post.board.workspace.name,
      }),
    });

    console.log(`[NOTIFICATIONS] Sent status change email to ${post.author.email}`);
  } catch (error) {
    console.error("[NOTIFICATIONS] Failed to send status change email:", error);
  }
}

interface NotifyNewFeedbackParams {
  postId: string;
}

/**
 * Notify workspace admins when new feedback is submitted
 */
export async function notifyNewFeedback({ postId }: NotifyNewFeedbackParams) {
  try {
    const post = await db.post.findUnique({
      where: { id: postId },
      include: {
        author: true,
        board: {
          include: {
            workspace: {
              include: {
                users: {
                  where: {
                    role: { in: ["ADMIN", "OWNER"] },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!post) return;

    const workspace = post.board.workspace;
    const admins = workspace.users.filter((u) => u.email && u.id !== post.authorId);

    if (admins.length === 0) return;

    const postUrl = `${APP_URL}/b/${workspace.slug}/${post.board.slug}/${post.id}`;
    const dashboardUrl = `${APP_URL}/dashboard`;

    // Send to all admins
    await Promise.all(
      admins.map((admin) =>
        resend.emails.send({
          from: FROM_EMAIL,
          to: admin.email,
          subject: `New feedback: ${post.title}`,
          react: NewFeedbackEmail({
            postTitle: post.title,
            postBody: post.body,
            authorName: post.author.name || "Anonymous",
            authorEmail: post.author.email,
            postUrl,
            dashboardUrl,
            workspaceName: workspace.name,
            boardName: post.board.name,
          }),
        })
      )
    );

    console.log(`[NOTIFICATIONS] Sent new feedback email to ${admins.length} admins`);
  } catch (error) {
    console.error("[NOTIFICATIONS] Failed to send new feedback email:", error);
  }
}

// Helper to format status for display
function formatStatus(status: string): string {
  const labels: Record<string, string> = {
    OPEN: "Open",
    UNDER_REVIEW: "Under Review",
    PLANNED: "Planned",
    IN_PROGRESS: "In Progress",
    COMPLETE: "Complete",
    CLOSED: "Closed",
  };
  return labels[status] || status;
}
