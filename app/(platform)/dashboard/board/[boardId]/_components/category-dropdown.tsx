"use client";

import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAction } from "@/hooks/use-action";
import { updatePostCategory } from "@/actions/update-post-category";

interface CategoryInfo {
  id: string;
  name: string;
  color: string;
}

interface CategoryDropdownProps {
  postId: string;
  currentCategory: CategoryInfo | null;
  categories: CategoryInfo[];
}

export function CategoryDropdown({
  postId,
  currentCategory,
  categories,
}: CategoryDropdownProps) {
  const { execute, isLoading } = useAction(updatePostCategory, {
    onSuccess: () => {
      toast.success("Category updated");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={isLoading}>
        <button
          className="cursor-pointer"
          aria-label={`Change category, current: ${currentCategory?.name ?? "None"}`}
        >
          {currentCategory ? (
            <Badge
              variant="outline"
              className="text-xs"
              style={{
                borderColor: currentCategory.color,
                color: currentCategory.color,
              }}
            >
              {currentCategory.name}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              No category
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => execute({ postId, categoryId: null })}
          className={!currentCategory ? "font-semibold" : undefined}
        >
          None
        </DropdownMenuItem>
        {categories.length > 0 && <DropdownMenuSeparator />}
        {categories.map((cat) => (
          <DropdownMenuItem
            key={cat.id}
            onClick={() => execute({ postId, categoryId: cat.id })}
            className={
              currentCategory?.id === cat.id ? "font-semibold" : undefined
            }
          >
            <span className="flex items-center gap-2">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              {cat.name}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
