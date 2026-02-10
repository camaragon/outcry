import { resend, FROM_EMAIL } from "./resend";
import { formatStatus } from "./status-labels";
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
  // Skip if status didn't actually change or Resend is not configured
  if (oldStatus === newStatus) return;
  if (!resend) return;

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

    console.log(
      `[NOTIFICATIONS] Sent status change email for post ${post.id} (authorId: ${post.author.id})`
    );
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
  if (!resend) return;

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
        resend!.emails.send({
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

    console.log(
      `[NOTIFICATIONS] Sent new feedback email to ${admins.length} admin(s) for post ${post.id}`
    );
  } catch (error) {
    console.error("[NOTIFICATIONS] Failed to send new feedback email:", error);
  }
}
