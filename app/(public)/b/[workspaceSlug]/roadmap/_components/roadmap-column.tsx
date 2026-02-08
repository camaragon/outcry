import { RoadmapCard } from "./roadmap-card";
import type { RoadmapPost } from "./roadmap-board";

interface RoadmapColumnProps {
  title: string;
  description: string;
  posts: RoadmapPost[];
  workspaceSlug: string;
}

export function RoadmapColumn({
  title,
  description,
  posts,
  workspaceSlug,
}: RoadmapColumnProps) {
  return (
    <div className="flex flex-col">
      {/* Column header */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{title}</h2>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
            {posts.length}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      {/* Column content */}
      <div className="flex flex-col gap-3">
        {posts.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            No items yet
          </div>
        ) : (
          posts.map((post) => (
            <RoadmapCard
              key={post.id}
              post={post}
              workspaceSlug={workspaceSlug}
            />
          ))
        )}
      </div>
    </div>
  );
}
