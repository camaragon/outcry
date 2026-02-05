import { Skeleton } from "@/components/ui/skeleton";

export function CategoryListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
          <Skeleton className="size-4 rounded-full" />
          <Skeleton className="h-5 flex-1 max-w-[200px]" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="size-8" />
        </div>
      ))}
    </div>
  );
}
