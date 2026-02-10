import { resend, FROM_EMAIL } from "./resend";
import { formatStatus } from "./status-labels";
import StatusChangeEmail from "@/emails/status-change";
import NewFeedbackEmail from "@/emails/new-feedback";
import { db } from "./db";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://outcry.app";

interface NotifyStatusChangeParams {
  postId: string;
  postTitle: string;
  oldStatus: string;
  newStatus: string;
  author: { id: string; email: string; name: string | null };
  boardSlug: string;
  workspaceSlug: string;
  workspaceName: string;
}

/**
 * Notify the post author when their feedback status changes.
 * Accepts pre-fetched data to avoid a redundant DB round-trip.
 */
export async function notifyStatusChange({
  postId,
  postTitle,
  oldStatus,
  newStatus,
  author,
  boardSlug,
  workspaceSlug,
  workspaceName,
}: NotifyStatusChangeParams) {
  if (oldStatus === newStatus) return;
  if (!resend) return;
  if (!author.email) return;

  try {
    const postUrl = `${APP_URL}/b/${workspaceSlug}/${boardSlug}/${postId}`;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: author.email,
      subject: `Your feedback is now ${formatStatus(newStatus)}`,
      react: StatusChangeEmail({
        userName: author.name || "there",
        postTitle,
        oldStatus,
        newStatus,
        postUrl,
        workspaceName,
      }),
    });

    console.log(
      `[NOTIFICATIONS] Sent status change email for post ${postId} (authorId: ${author.id})`
    );
  } catch (error) {
    console.error("[NOTIFICATIONS] Failed to send status change email:", error);
  }
}

interface NotifyNewFeedbackParams {
  postId: string;
}

/**
 * Notify workspace admins when new feedback is submitted.
 * Still queries DB since create-post doesn't fetch admin list.
 */
export async function notifyNewFeedback({ postId }: NotifyNewFeedbackParams) {
  if (!resend) return;
  const client = resend;

  try {
    const post = await db.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        title: true,
        body: true,
        authorId: true,
        author: {
          select: {
            name: true,
            email: true,
          },
        },
        board: {
          select: {
            slug: true,
            name: true,
            workspace: {
              select: {
                slug: true,
                name: true,
                users: {
                  where: {
                    role: { in: ["ADMIN", "OWNER"] },
                  },
                  select: {
                    id: true,
                    email: true,
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
        client.emails.send({
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
