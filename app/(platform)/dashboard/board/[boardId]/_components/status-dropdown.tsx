"use client";

import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAction } from "@/hooks/use-action";
import { updatePostStatus } from "@/actions/update-post-status";

const STATUSES = [
  { value: "OPEN", label: "Open" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "PLANNED", label: "Planned" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETE", label: "Complete" },
  { value: "CLOSED", label: "Closed" },
] as const;

type StatusValue = (typeof STATUSES)[number]["value"];

const STATUS_VARIANTS: Record<StatusValue, "default" | "secondary" | "outline"> = {
  OPEN: "outline",
  UNDER_REVIEW: "secondary",
  PLANNED: "secondary",
  IN_PROGRESS: "default",
  COMPLETE: "default",
  CLOSED: "outline",
};

interface StatusDropdownProps {
  postId: string;
  currentStatus: StatusValue;
}

export function StatusDropdown({ postId, currentStatus }: StatusDropdownProps) {
  const { execute, isLoading } = useAction(updatePostStatus, {
    onSuccess: () => {
      toast.success("Status updated");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const currentLabel =
    STATUSES.find((s) => s.value === currentStatus)?.label ?? currentStatus;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={isLoading}>
        <button
          className="cursor-pointer"
          aria-label={`Change status, current: ${currentLabel}`}
        >
          <Badge variant={STATUS_VARIANTS[currentStatus]} className="text-xs">
            {currentLabel}
          </Badge>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {STATUSES.map((status) => (
          <DropdownMenuItem
            key={status.value}
            onClick={() => execute({ postId, status: status.value })}
            className={
              status.value === currentStatus ? "font-semibold" : undefined
            }
          >
            {status.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
