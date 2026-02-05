"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAction } from "@/hooks/use-action";
import { createComment } from "@/actions/create-comment";

interface CommentFormProps {
  postId: string;
}

export function CommentForm({ postId }: CommentFormProps) {
  const [body, setBody] = useState("");

  const { execute, fieldErrors, error, isLoading } = useAction(createComment, {
    onSuccess: () => {
      toast.success("Comment added!");
      setBody("");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    execute({ body, postId });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Label htmlFor="comment-body" className="sr-only">
        Write a comment
      </Label>
      <Textarea
        id="comment-body"
        placeholder="Write a comment..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        aria-invalid={!!fieldErrors?.body}
        aria-describedby={fieldErrors?.body ? "comment-body-error" : undefined}
        disabled={isLoading}
        className="min-h-[80px]"
      />
      {fieldErrors?.body && (
        <p id="comment-body-error" className="text-sm text-destructive">
          {fieldErrors.body[0]}
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={isLoading || !body.trim()}>
          {isLoading ? "Posting..." : "Comment"}
        </Button>
      </div>
    </form>
  );
}
