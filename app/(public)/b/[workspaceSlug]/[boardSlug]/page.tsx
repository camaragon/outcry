import { Suspense } from "react";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Megaphone, Settings } from "lucide-react";
import { db } from "@/lib/db";
import { getAuthorizedUser } from "@/lib/get-authorized-user";
import { POST_STATUSES } from "@/lib/post-statuses";
import { Button } from "@/components/ui/button";
import { PostList } from "./_components/post-list";
import { PostListSkeleton } from "./_components/post-list-skeleton";
import { CreatePostDialog } from "./_components/create-post-dialog";
import { SortFilterBar } from "./_components/sort-filter-bar";

const VALID_SORTS = ["top", "new", "trending"] as const;

interface PublicBoardPageProps {
  params: Promise<{
    workspaceSlug: string;
    boardSlug: string;
  }>;
  searchParams: Promise<{
    sort?: string;
    status?: string;
    category?: string;
  }>;
}

export default async function PublicBoardPage({
  params,
  searchParams,
}: PublicBoardPageProps) {
  const [{ workspaceSlug, boardSlug }, resolvedSearchParams] =
    await Promise.all([params, searchParams]);

  // Validate sort param against known values
  const requestedSort = resolvedSearchParams.sort;
  const sort = requestedSort && VALID_SORTS.includes(requestedSort as typeof VALID_SORTS[number])
    ? requestedSort
    : "top";

  // Validate status param against known statuses
  const requestedStatus = resolvedSearchParams.status;
  const status = requestedStatus && POST_STATUSES.includes(requestedStatus as typeof POST_STATUSES[number])
    ? requestedStatus
    : "";

  const category = resolvedSearchParams.category ?? "";

  // Parallelize independent calls
  const [workspace, { userId }] = await Promise.all([
    db.workspace.findUnique({
      where: { slug: workspaceSlug },
      select: { id: true, name: true, logo: true },
    }),
    auth(),
  ]);

  if (!workspace) {
    notFound();
  }

  const [board, categories, adminUser] = await Promise.all([
    db.board.findUnique({
      where: {
        workspaceId_slug: {
          workspaceId: workspace.id,
          slug: boardSlug,
        },
      },
      select: { id: true, name: true, slug: true, isPublic: true },
    }),
    db.category.findMany({
      where: { workspaceId: workspace.id },
      select: { id: true, name: true, color: true },
      orderBy: { name: "asc" },
    }),
    // Check if current user is an admin (runs in parallel)
    userId ? getAuthorizedUser(userId, workspace.id) : null,
  ]);

  if (!board || !board.isPublic) {
    notFound();
  }

  const isSignedIn = !!userId;
  const isAdmin = !!adminUser;

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
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{workspace.name}</p>
          <h1 className="text-2xl font-bold">{board.name}</h1>
        </div>
        {isAdmin && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/board/${board.id}`}>
              <Settings className="size-4" />
              Admin
            </Link>
          </Button>
        )}
      </div>

      {/* New post button */}
      <div className="mb-6">
        <CreatePostDialog
          boardId={board.id}
          isSignedIn={isSignedIn}
          workspaceSlug={workspaceSlug}
          boardSlug={boardSlug}
        />
      </div>

      {/* Sort & Filter Bar
          Note: categories fetched at page level blocks initial render, but this is
          acceptable since categories are a small indexed lookup (<10 rows typically).
          Alternative would be streaming categories through a shared Suspense boundary. */}
      <SortFilterBar
        categories={categories}
        currentSort={sort}
        currentStatus={status || "all"}
        currentCategory={category || "all"}
      />

      {/* Posts list — streamed with Suspense */}
      <Suspense fallback={<PostListSkeleton />}>
        <PostList
          boardId={board.id}
          workspaceId={workspace.id}
          workspaceSlug={workspaceSlug}
          boardSlug={boardSlug}
          sort={sort}
          status={status || undefined}
          categoryId={category || undefined}
        />
      </Suspense>
    </div>
  );
}
