import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { AdminPostList } from "./_components/admin-post-list";
import { AdminPostListSkeleton } from "./_components/admin-post-list-skeleton";

interface AdminBoardPageProps {
  params: Promise<{
    boardId: string;
  }>;
}

export default async function AdminBoardPage({ params }: AdminBoardPageProps) {
  const { boardId } = await params;

  // Parallelize independent calls
  const [user, board] = await Promise.all([
    currentUser(),
    db.board.findUnique({
      where: { id: boardId },
      include: {
        workspace: { select: { id: true, name: true, slug: true } },
      },
    }),
  ]);

  if (!user?.id) redirect("/sign-in");
  if (!board) notFound();

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

      {/* Posts — streamed with Suspense */}
      <Suspense fallback={<AdminPostListSkeleton />}>
        <AdminPostList boardId={board.id} />
      </Suspense>
    </div>
  );
}
