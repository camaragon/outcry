"use client";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAction } from "@/hooks/use-action";
import { deleteCategory } from "@/actions/delete-category";

interface CategoryItemProps {
  category: {
    id: string;
    name: string;
    color: string;
  };
  postCount: number;
}

export function CategoryItem({ category, postCount }: CategoryItemProps) {
  const { execute, isLoading } = useAction(deleteCategory, {
    onSuccess: () => {
      toast.success(`Category "${category.name}" deleted`);
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <span
        className="size-4 rounded-full shrink-0"
        style={{ backgroundColor: category.color }}
      />
      <span className="font-medium flex-1">{category.name}</span>
      <Badge variant="secondary" className="text-xs">
        {postCount} {postCount === 1 ? "post" : "posts"}
      </Badge>
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={isLoading}
        onClick={() => {
          if (
            confirm(
              `Delete "${category.name}"? Posts using this category will become uncategorized.`,
            )
          ) {
            execute({ categoryId: category.id });
          }
        }}
        aria-label={`Delete ${category.name}`}
      >
        <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
      </Button>
    </div>
  );
}
