import { Suspense } from "react";
import { redirect, notFound } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

// Auth-protected page — skip static generation
export const dynamic = "force-dynamic";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { CategoryList } from "./_components/category-list";
import { CategoryListSkeleton } from "./_components/category-list-skeleton";
import { CreateCategoryForm } from "./_components/create-category-form";

export default async function CategoriesPage() {
  const user = await currentUser();

  if (!user?.id) redirect("/sign-in");

  const dbUser = await db.user.findFirst({
    where: {
      clerkId: user.id,
      role: { in: ["OWNER", "ADMIN"] },
    },
    select: {
      id: true,
      workspace: { select: { id: true, name: true } },
    },
  });

  if (!dbUser) {
    notFound();
  }

  const workspace = dbUser.workspace;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/dashboard" aria-label="Back to dashboard">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <p className="text-sm text-muted-foreground">{workspace.name}</p>
          <h1 className="text-2xl font-bold">Categories</h1>
        </div>
      </div>

      {/* Create category form */}
      <div className="mb-8 max-w-lg">
        <CreateCategoryForm workspaceId={workspace.id} />
      </div>

      {/* Category list — streamed with Suspense */}
      <div className="max-w-lg">
        <Suspense fallback={<CategoryListSkeleton />}>
          <CategoryList workspaceId={workspace.id} />
        </Suspense>
      </div>
    </div>
  );
}
