import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Tags } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { DashboardHeaderMenu } from "./_components/dashboard-header-menu";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user?.id) redirect("/sign-in");

  // Find user's workspace
  const dbUser = await db.user.findFirst({
    where: { clerkId: user.id },
    include: {
      workspace: {
        include: {
          boards: {
            include: {
              _count: {
                select: { posts: true },
              },
            },
          },
          _count: {
            select: { users: true },
          },
        },
      },
    },
  });

  // If no workspace, redirect to onboarding
  if (!dbUser?.workspace) {
    redirect("/onboarding");
  }

  const workspace = dbUser.workspace;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{workspace.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back, {user.firstName || "there"}! Here&apos;s your workspace
            overview.
          </p>
        </div>
        <DashboardHeaderMenu
          workspaceId={workspace.id}
          isPro={workspace.plan === "PRO"}
          isAdmin={["OWNER", "ADMIN"].includes(dbUser.role)}
        />
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Boards</p>
          <p className="text-2xl font-bold">{workspace.boards.length}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total Posts</p>
          <p className="text-2xl font-bold">
            {workspace.boards.reduce((sum, b) => sum + b._count.posts, 0)}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Team Members</p>
          <p className="text-2xl font-bold">{workspace._count.users}</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="mb-8">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/categories">
            <Tags className="size-4" />
            Manage Categories
          </Link>
        </Button>
      </div>

      {/* Boards */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Your boards</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workspace.boards.map((board) => (
            <Link
              key={board.id}
              href={`/dashboard/board/${board.id}`}
              className="group rounded-lg border p-4 transition hover:border-foreground/20 hover:shadow-sm"
            >
              <h3 className="font-medium group-hover:text-primary transition">
                {board.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {board._count.posts} {board._count.posts === 1 ? "post" : "posts"}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                /{board.slug}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
