"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { ArrowDownUp, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_LABELS, POST_STATUSES } from "@/lib/post-statuses";

const SORT_OPTIONS = [
  { value: "top", label: "Top" },
  { value: "new", label: "New" },
  { value: "trending", label: "Trending" },
] as const;

const DEFAULT_SORT = "top";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface SortFilterBarProps {
  categories: Category[];
  currentSort: string;
  currentStatus: string;
  currentCategory: string;
}

export function SortFilterBar({
  categories,
  currentSort,
  currentStatus,
  currentCategory,
}: SortFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      // Remove param if it's empty, "all", or the default sort value
      const isDefault =
        value === "" ||
        value === "all" ||
        (key === "sort" && value === DEFAULT_SORT);
      if (isDefault) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      {/* Sort */}
      <div className="flex items-center gap-1.5">
        <ArrowDownUp className="size-4 shrink-0 text-muted-foreground" />
        <div className="flex gap-1">
          {SORT_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={currentSort === opt.value ? "default" : "outline"}
              size="sm"
              onClick={() => updateParam("sort", opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:ml-auto">
        <Filter className="size-4 shrink-0 text-muted-foreground" />

        {/* Status filter */}
        <Select
          value={currentStatus}
          onValueChange={(val) => updateParam("status", val)}
        >
          <SelectTrigger className="h-9 w-full min-w-0 sm:w-[150px] text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {POST_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {STATUS_LABELS[status].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category filter */}
        {categories.length > 0 && (
          <Select
            value={currentCategory}
            onValueChange={(val) => updateParam("category", val)}
          >
            <SelectTrigger className="h-9 w-full min-w-0 sm:w-[150px] text-sm">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block size-2.5 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    {cat.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}
