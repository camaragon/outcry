import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
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
}

export default async function PublicRoadmapPage({
  params,
}: PublicRoadmapPageProps) {
  const { workspaceSlug } = await params;

  const workspace = await db.workspace.findUnique({
    where: { slug: workspaceSlug },
    select: {
      id: true,
      name: true,
      logo: true,
      boards: {
        where: { isPublic: true },
        select: { slug: true },
        take: 1,
      },
    },
  });

  if (!workspace) {
    notFound();
  }

  // Get the first public board slug for the "back to board" link
  const boardSlug = workspace.boards[0]?.slug;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            {boardSlug && (
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/b/${workspaceSlug}/${boardSlug}`}>
                  <ArrowLeft className="size-4" />
                  Back to board
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

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
          Powered by{" "}
          <a
            href="https://outcry.app"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:underline"
          >
            Outcry
          </a>
        </div>
      </footer>
    </div>
  );
}
