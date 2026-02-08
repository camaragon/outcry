import { Skeleton } from "@/components/ui/skeleton";

export const RoadmapSkeleton = () => {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {[1, 2, 3].map((col) => (
        <div key={col} className="flex flex-col">
          {/* Column header skeleton */}
          <div className="mb-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="mt-2 h-4 w-48" />
          </div>

          {/* Cards skeleton */}
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((card) => (
              <div
                key={card}
                className="rounded-xl border p-4"
              >
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="mt-2 h-4 w-16" />
                <div className="mt-3 flex gap-3">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
