import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { ArrowLeft, ExternalLink, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusDropdown } from "./_components/status-dropdown";

interface AdminBoardPageProps {
  params: Promise<{
    boardId: string;
  }>;
}

export default async function AdminBoardPage({ params }: AdminBoardPageProps) {
  const { boardId } = await params;

  const user = await currentUser();
  if (!user?.id) redirect("/sign-in");

  // Fetch board with workspace
  const board = await db.board.findUnique({
    where: { id: boardId },
    include: {
      workspace: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!board) {
    notFound();
  }

  // Verify user is OWNER or ADMIN
  const dbUser = await db.user.findFirst({
    where: {
      clerkId: user.id,
      workspaceId: board.workspaceId,
      role: { in: ["OWNER", "ADMIN"] },
    },
    select: { id: true },
  });

  if (!dbUser) {
    notFound();
  }

  // Fetch posts
  const posts = await db.post.findMany({
    where: { boardId: board.id },
    orderBy: [{ voteCount: "desc" }, { createdAt: "desc" }],
    include: {
      author: { select: { name: true, email: true } },
      category: { select: { name: true, color: true } },
      _count: { select: { comments: true } },
    },
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/dashboard" aria-label="Back to dashboard">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">
            {board.workspace.name}
          </p>
          <h1 className="text-2xl font-bold">{board.name}</h1>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link
            href={`/b/${board.workspace.slug}/${board.slug}`}
            target="_blank"
          >
            <ExternalLink className="size-4" />
            Public View
          </Link>
        </Button>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <h3 className="text-lg font-medium">No posts yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Posts will appear here when users submit feedback on your public
            board.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-start gap-4 rounded-lg border p-4"
            >
              {/* Vote count */}
              <div className="flex min-w-[3rem] flex-col items-center rounded-md border px-2 py-1.5">
                <span className="text-lg font-bold">{post.voteCount}</span>
                <span className="text-xs text-muted-foreground">votes</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium">{post.title}</h3>
                  <StatusDropdown
                    postId={post.id}
                    currentStatus={post.status}
                  />
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
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {post.body.length > 200
                    ? post.body.slice(0, 200) + "…"
                    : post.body}
                </p>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>
                    by {post.author.name ?? post.author.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="size-3.5" />
                    {post._count.comments}
                  </span>
                  <span>
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
