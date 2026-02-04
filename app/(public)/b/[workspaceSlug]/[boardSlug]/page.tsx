import { notFound } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { Megaphone } from "lucide-react";
import { db } from "@/lib/db";
import { PostCard } from "./_components/post-card";
import { CreatePostDialog } from "./_components/create-post-dialog";

interface PublicBoardPageProps {
  params: Promise<{
    workspaceSlug: string;
    boardSlug: string;
  }>;
}

export default async function PublicBoardPage({ params }: PublicBoardPageProps) {
  const { workspaceSlug, boardSlug } = await params;

  // Look up the workspace and board
  const workspace = await db.workspace.findUnique({
    where: { slug: workspaceSlug },
    select: { id: true, name: true, logo: true },
  });

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

  // Fetch posts sorted by vote count desc, then newest
  const posts = await db.post.findMany({
    where: { boardId: board.id },
    orderBy: [{ voteCount: "desc" }, { createdAt: "desc" }],
    include: {
      category: { select: { name: true, color: true } },
      _count: { select: { comments: true } },
    },
  });

  // Check current user and their votes
  const user = await currentUser();
  const isSignedIn = !!user?.id;

  let votedPostIds = new Set<string>();
  if (user?.id) {
    const dbUser = await db.user.findFirst({
      where: { clerkId: user.id, workspaceId: workspace.id },
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

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Workspace branding */}
      <div className="mb-6 flex items-center gap-3">
        {workspace.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={workspace.logo}
            alt={workspace.name}
            className="size-10 rounded-lg object-cover"
          />
        ) : (
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Megaphone className="size-5" />
          </div>
        )}
        <div>
          <p className="text-sm text-muted-foreground">{workspace.name}</p>
          <h1 className="text-2xl font-bold">{board.name}</h1>
        </div>
      </div>

      {/* New post button */}
      <div className="mb-6">
        <CreatePostDialog boardId={board.id} isSignedIn={isSignedIn} />
      </div>

      {/* Posts list */}
      {posts.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <Megaphone className="mx-auto size-10 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No posts yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Be the first to share your feedback!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              workspaceSlug={workspaceSlug}
              boardSlug={boardSlug}
              hasVoted={votedPostIds.has(post.id)}
              isSignedIn={isSignedIn}
            />
          ))}
        </div>
      )}
    </div>
  );
}
