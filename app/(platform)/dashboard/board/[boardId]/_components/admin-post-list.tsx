import { MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { StatusDropdown } from "./status-dropdown";

interface AdminPostListProps {
  boardId: string;
}

export async function AdminPostList({ boardId }: AdminPostListProps) {
  const posts = await db.post.findMany({
    where: { boardId },
    orderBy: [{ voteCount: "desc" }, { createdAt: "desc" }],
    include: {
      author: { select: { name: true, email: true } },
      category: { select: { name: true, color: true } },
      _count: { select: { comments: true } },
    },
  });

  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <h3 className="text-lg font-medium">No posts yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Posts will appear here when users submit feedback on your public
          board.
        </p>
      </div>
    );
  }

  return (
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
              {post.body}
            </p>
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span>by {post.author.name ?? post.author.email}</span>
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
  );
}
