import { currentUser } from "@clerk/nextjs/server";
import { Megaphone } from "lucide-react";
import { db } from "@/lib/db";
import { PostCard } from "./post-card";

interface PostListProps {
  boardId: string;
  workspaceId: string;
}

export async function PostList({
  boardId,
  workspaceId,
}: PostListProps) {
  const [posts, user] = await Promise.all([
    db.post.findMany({
      where: { boardId },
      orderBy: [{ voteCount: "desc" }, { createdAt: "desc" }],
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
          Be the first to share your feedback!
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
        />
      ))}
    </div>
  );
}
