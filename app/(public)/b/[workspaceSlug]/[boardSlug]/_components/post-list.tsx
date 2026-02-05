import { currentUser } from "@clerk/nextjs/server";
import { Megaphone } from "lucide-react";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { PostCard } from "./post-card";

interface PostListProps {
  boardId: string;
  workspaceId: string;
  workspaceSlug: string;
  boardSlug: string;
  sort?: string;
  status?: string;
  categoryId?: string;
}

export async function PostList({
  boardId,
  workspaceId,
  workspaceSlug,
  boardSlug,
  sort = "top",
  status,
  categoryId,
}: PostListProps) {
  // Build where clause
  const where: Prisma.PostWhereInput = { boardId };

  if (status) {
    where.status = status as Prisma.EnumPostStatusFilter;
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  // For trending: only posts from last 30 days
  if (sort === "trending") {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    where.createdAt = { gte: thirtyDaysAgo };
  }

  // Build orderBy
  let orderBy: Prisma.PostOrderByWithRelationInput[];
  switch (sort) {
    case "new":
      orderBy = [{ createdAt: "desc" }];
      break;
    case "trending":
      orderBy = [{ voteCount: "desc" }, { createdAt: "desc" }];
      break;
    case "top":
    default:
      orderBy = [{ voteCount: "desc" }, { createdAt: "desc" }];
      break;
  }

  const [posts, user] = await Promise.all([
    db.post.findMany({
      where,
      orderBy,
      include: {
        category: { select: { name: true, color: true } },
        _count: { select: { comments: true } },
      },
    }),
    currentUser(),
  ]);

  const isSignedIn = !!user?.id;

  let votedPostIds = new Set<string>();
  if (user?.id && posts.length > 0) {
    const dbUser = await db.user.findFirst({
      where: { clerkId: user.id, workspaceId },
      select: { id: true },
    });

    if (dbUser) {
      const votes = await db.vote.findMany({
        where: {
          userId: dbUser.id,
          postId: { in: posts.map((p) => p.id) },
        },
        select: { postId: true },
      });
      votedPostIds = new Set(votes.map((v) => v.postId));
    }
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <Megaphone className="mx-auto size-10 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No posts yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {status || categoryId
            ? "No posts match the current filters."
            : "Be the first to share your feedback!"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          hasVoted={votedPostIds.has(post.id)}
          isSignedIn={isSignedIn}
          workspaceSlug={workspaceSlug}
          boardSlug={boardSlug}
        />
      ))}
    </div>
  );
}
