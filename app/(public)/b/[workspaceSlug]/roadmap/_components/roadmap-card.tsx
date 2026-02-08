import Link from "next/link";
import { ChevronUp, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { RoadmapPost } from "./roadmap-board";

interface RoadmapCardProps {
  post: RoadmapPost;
  workspaceSlug: string;
}

export function RoadmapCard({ post, workspaceSlug }: RoadmapCardProps) {
  return (
    <Link href={`/b/${workspaceSlug}/${post.board.slug}/${post.id}`}>
      <Card className="transition hover:border-foreground/20 hover:shadow-sm">
        <CardContent className="p-4">
          <h3 className="font-medium leading-snug">{post.title}</h3>
          
          {post.category && (
            <Badge
              variant="outline"
              className="mt-2 text-xs"
              style={{
                borderColor: post.category.color,
                color: post.category.color,
              }}
            >
              {post.category.name}
            </Badge>
          )}

          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <ChevronUp className="size-3.5" />
              {post.voteCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="size-3.5" />
              {post._count.comments}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
