import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { STATUS_LABELS, type PostStatus } from "@/lib/post-statuses";
import { UpvoteButton } from "../_components/upvote-button";
import { CommentsSection } from "./_components/comments-section";
import { CommentsSkeleton } from "./_components/comments-skeleton";

interface PostDetailPageProps {
  params: Promise<{
    workspaceSlug: string;
    boardSlug: string;
    postId: string;
  }>;
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { workspaceSlug, boardSlug, postId } = await params;

  // Parallelize independent calls
  const [user, workspace] = await Promise.all([
    currentUser(),
    db.workspace.findUnique({
      where: { slug: workspaceSlug },
      select: { id: true, name: true },
    }),
  ]);

  if (!workspace) {
    notFound();
  }

  const board = await db.board.findUnique({
    where: {
      workspaceId_slug: {
        workspaceId: workspace.id,
        slug: boardSlug,
      },
    },
    select: { id: true, name: true, slug: true, isPublic: true },
  });

  if (!board || !board.isPublic) {
    notFound();
  }

  const post = await db.post.findUnique({
    where: { id: postId, boardId: board.id },
    include: {
      author: { select: { name: true, email: true } },
      category: { select: { name: true, color: true } },
      _count: { select: { comments: true } },
    },
  });

  if (!post) {
    notFound();
  }

  const isSignedIn = !!user?.id;

  // Check if user has voted — single query via nested relation
  let hasVoted = false;
  if (user?.id) {
    const vote = await db.vote.findFirst({
      where: {
        postId: post.id,
        user: { clerkId: user.id, workspaceId: workspace.id },
      },
      select: { id: true },
    });
    hasVoted = !!vote;
  }

  const statusInfo = STATUS_LABELS[post.status as PostStatus] ?? STATUS_LABELS.OPEN;
  const boardUrl = `/b/${workspaceSlug}/${boardSlug}`;
  const currentPath = `/b/${workspaceSlug}/${boardSlug}/${postId}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Back link */}
      <Link
        href={boardUrl}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to {board.name}
      </Link>

      {/* Post content */}
      <div className="mt-4 flex items-start gap-4">
        <UpvoteButton
          postId={post.id}
          voteCount={post.voteCount}
          hasVoted={hasVoted}
          isSignedIn={isSignedIn}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">{post.title}</h1>
            <Badge variant={statusInfo.variant} className="text-xs">
              {statusInfo.label}
            </Badge>
            {post.category && (
              <Badge
                variant="outline"
                className="text-xs"
                style={{
                  borderColor: post.category.color,
                  color: post.category.color,
                }}
              >
                {post.category.name}
              </Badge>
            )}
          </div>

          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <span>{post.author.name || post.author.email}</span>
            <span>
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          <p className="mt-4 text-sm text-foreground whitespace-pre-wrap">
            {post.body}
          </p>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Comments section */}
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <MessageCircle className="size-5" />
          Comments
          <span className="text-sm font-normal text-muted-foreground">
            ({post._count.comments})
          </span>
        </h2>

        <div className="mt-4">
          <Suspense fallback={<CommentsSkeleton />}>
            <CommentsSection postId={post.id} currentPath={currentPath} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
