"use client";

import { useRouter } from "next/navigation";
import { ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAction } from "@/hooks/use-action";
import { toggleVote } from "@/actions/toggle-vote";
import { cn } from "@/lib/utils";

interface UpvoteButtonProps {
  postId: string;
  voteCount: number;
  hasVoted: boolean;
  isSignedIn: boolean;
}

export function UpvoteButton({
  postId,
  voteCount,
  hasVoted,
  isSignedIn,
}: UpvoteButtonProps) {
  const router = useRouter();

  const { execute, isLoading } = useAction(toggleVote, {
    onError: (error) => {
      toast.error(error);
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSignedIn) {
      router.push(`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    execute({ postId });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        "flex h-auto flex-col gap-0.5 px-3 py-2 min-w-[3.5rem]",
        hasVoted &&
          "border-primary/50 bg-primary/10 text-primary hover:bg-primary/15 dark:bg-primary/15 dark:hover:bg-primary/20",
      )}
      onClick={handleClick}
      disabled={isLoading}
      aria-label={hasVoted ? "Remove upvote" : "Upvote"}
      aria-pressed={hasVoted}
    >
      <ChevronUp className="size-4" />
      <span className="text-sm font-semibold">{voteCount}</span>
    </Button>
  );
}
