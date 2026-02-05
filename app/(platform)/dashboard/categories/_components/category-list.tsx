import { db } from "@/lib/db";
import { CategoryItem } from "./category-item";

interface CategoryListProps {
  workspaceId: string;
}

export async function CategoryList({ workspaceId }: CategoryListProps) {
  const categories = await db.category.findMany({
    where: { workspaceId },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { posts: true } },
    },
  });

  if (categories.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <h3 className="text-lg font-medium">No categories yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Create your first category to organize posts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {categories.map((category) => (
        <CategoryItem
          key={category.id}
          category={category}
          postCount={category._count.posts}
        />
      ))}
    </div>
  );
}
