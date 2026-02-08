import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { RoadmapColumn } from "./roadmap-column";

// Roadmap shows these statuses in these columns
const ROADMAP_COLUMNS = [
  { status: "PLANNED" as const, title: "Planned", description: "We've decided to build this" },
  { status: "IN_PROGRESS" as const, title: "In Progress", description: "Actively working on it" },
  { status: "COMPLETE" as const, title: "Complete", description: "Shipped!" },
];

// Prisma select shape for roadmap posts
const roadmapPostSelect = {
  id: true,
  title: true,
  voteCount: true,
  status: true,
  updatedAt: true,
  category: {
    select: {
      name: true,
      color: true,
    },
  },
  board: {
    select: {
      slug: true,
    },
  },
  _count: {
    select: {
      comments: true,
    },
  },
} satisfies Prisma.PostSelect;

// Infer the post type from Prisma's return type
export type RoadmapPost = Prisma.PostGetPayload<{ select: typeof roadmapPostSelect }>;

interface RoadmapBoardProps {
  workspaceId: string;
  workspaceSlug: string;
}

export async function RoadmapBoard({
  workspaceId,
  workspaceSlug,
}: RoadmapBoardProps) {
  // Fetch posts for all roadmap statuses in parallel
  const postsPromises = ROADMAP_COLUMNS.map((column) =>
    db.post.findMany({
      where: {
        board: {
          workspaceId,
          isPublic: true,
        },
        status: column.status,
      },
      select: roadmapPostSelect,
      orderBy: [
        { voteCount: "desc" },
        { updatedAt: "desc" },
      ],
      // Limit complete posts to top 20 by votes to avoid infinite growth
      ...(column.status === "COMPLETE" ? { take: 20 } : {}),
    })
  );

  const [plannedPosts, inProgressPosts, completePosts] = await Promise.all(postsPromises);

  const columnData = [
    { ...ROADMAP_COLUMNS[0], posts: plannedPosts },
    { ...ROADMAP_COLUMNS[1], posts: inProgressPosts },
    { ...ROADMAP_COLUMNS[2], posts: completePosts },
  ];

  const isEmpty = plannedPosts.length === 0 && inProgressPosts.length === 0 && completePosts.length === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium">No roadmap items yet</p>
        <p className="mt-1 text-muted-foreground">
          Check back soon to see what we&apos;re working on
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {columnData.map((column) => (
        <RoadmapColumn
          key={column.status}
          title={column.title}
          description={column.description}
          posts={column.posts}
          workspaceSlug={workspaceSlug}
        />
      ))}
    </div>
  );
}
