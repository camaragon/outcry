import { Skeleton } from "@/components/ui/skeleton";

export function AdminPostListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-4 rounded-lg border p-4"
        >
          <Skeleton className="h-16 w-12 rounded-md" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
