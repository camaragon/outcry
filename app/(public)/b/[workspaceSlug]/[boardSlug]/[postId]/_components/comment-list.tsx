import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface CommentData {
  id: string;
  body: string;
  isAdmin: boolean;
  createdAt: Date;
  author: {
    name: string | null;
    email: string;
  };
}

interface CommentListProps {
  comments: CommentData[];
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No comments yet. Be the first to share your thoughts!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {comment.author.name || comment.author.email}
              </span>
              {comment.isAdmin && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  Team
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">
              {comment.body}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
