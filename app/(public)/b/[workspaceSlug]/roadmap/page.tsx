import { Suspense, cache } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Megaphone, ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { RoadmapBoard } from "./_components/roadmap-board";
import { RoadmapSkeleton } from "./_components/roadmap-skeleton";

interface PublicRoadmapPageProps {
  params: Promise<{
    workspaceSlug: string;
  }>;
  searchParams: Promise<{
    from?: string;
  }>;
}

// Cached workspace fetch to dedupe between generateMetadata and page
const getWorkspace = cache(async (workspaceSlug: string) => {
  return db.workspace.findUnique({
    where: { slug: workspaceSlug },
    select: {
      id: true,
      name: true,
      logo: true,
      boards: {
        where: { isPublic: true },
        select: { slug: true },
      },
    },
  });
});

export async function generateMetadata({
  params,
}: PublicRoadmapPageProps): Promise<Metadata> {
  const { workspaceSlug } = await params;
  const workspace = await getWorkspace(workspaceSlug);

  return {
    title: `Roadmap — ${workspace?.name ?? workspaceSlug}`,
  };
}

export default async function PublicRoadmapPage({
  params,
  searchParams,
}: PublicRoadmapPageProps) {
  const [{ workspaceSlug }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);

  const workspace = await getWorkspace(workspaceSlug);

  if (!workspace) {
    notFound();
  }

  // Use `from` param if it matches a valid public board, otherwise fall back to first board
  const fromSlug = resolvedSearchParams.from;
  const validBoardSlugs = workspace.boards.map((b) => b.slug);
  const boardSlug = fromSlug && validBoardSlugs.includes(fromSlug)
    ? fromSlug
    : validBoardSlugs[0];

  return (
    <div>
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex h-auto min-h-[4rem] max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:h-16 sm:flex-nowrap sm:py-0">
          <div className="flex items-center gap-2 sm:gap-4">
            {boardSlug && (
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/b/${workspaceSlug}/${boardSlug}`}>
                  <ArrowLeft className="size-4" />
                  <span className="hidden sm:inline">Back to board</span>
                  <span className="sm:hidden">Back</span>
                </Link>
              </Button>
            )}
            <div className="flex items-center gap-3">
              {workspace.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={workspace.logo}
                  alt={workspace.name}
                  className="size-8 rounded-lg object-cover"
                />
              ) : (
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Megaphone className="size-4" />
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">{workspace.name}</p>
                <h1 className="font-semibold">Roadmap</h1>
              </div>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Roadmap Board */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        <Suspense fallback={<RoadmapSkeleton />}>
          <RoadmapBoard workspaceId={workspace.id} workspaceSlug={workspaceSlug} />
        </Suspense>
      </main>
    </div>
  );
}
