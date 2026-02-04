import { MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { UpvoteButton } from "./upvote-button";

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  OPEN: { label: "Open", variant: "outline" },
  UNDER_REVIEW: { label: "Under Review", variant: "secondary" },
  PLANNED: { label: "Planned", variant: "secondary" },
  IN_PROGRESS: { label: "In Progress", variant: "default" },
  COMPLETE: { label: "Complete", variant: "default" },
  CLOSED: { label: "Closed", variant: "outline" },
};

interface PostCardProps {
  post: {
    id: string;
    title: string;
    body: string;
    status: string;
    voteCount: number;
    createdAt: Date;
    category: { name: string; color: string } | null;
    _count: { comments: number };
  };
  hasVoted: boolean;
  isSignedIn: boolean;
}

export function PostCard({
  post,
  hasVoted,
  isSignedIn,
}: PostCardProps) {
  const statusInfo = STATUS_LABELS[post.status] ?? STATUS_LABELS.OPEN;

  return (
    <div className="flex items-start gap-4 rounded-lg border p-4 transition hover:border-foreground/20 hover:shadow-sm">
      <UpvoteButton
        postId={post.id}
        voteCount={post.voteCount}
        hasVoted={hasVoted}
        isSignedIn={isSignedIn}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-medium text-foreground">{post.title}</h3>
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
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {post.body}
        </p>
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
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
  );
}
