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
import { POST_STATUSES, STATUS_LABELS, type PostStatus } from "@/lib/post-statuses";

interface StatusDropdownProps {
  postId: string;
  currentStatus: PostStatus;
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

  const currentInfo = STATUS_LABELS[currentStatus];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={isLoading}>
        <button
          className="cursor-pointer"
          aria-label={`Change status, current: ${currentInfo.label}`}
        >
          <Badge variant={currentInfo.variant} className="text-xs">
            {currentInfo.label}
          </Badge>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {POST_STATUSES.map((status) => (
          <DropdownMenuItem
            key={status}
            onClick={() => execute({ postId, status })}
            className={
              status === currentStatus ? "font-semibold" : undefined
            }
          >
            {STATUS_LABELS[status].label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
