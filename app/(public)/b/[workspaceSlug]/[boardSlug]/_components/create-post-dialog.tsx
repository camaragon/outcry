"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAction } from "@/hooks/use-action";
import { createPost } from "@/actions/create-post";

interface CreatePostDialogProps {
  boardId: string;
  isSignedIn: boolean;
}

export function CreatePostDialog({
  boardId,
  isSignedIn,
}: CreatePostDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const { execute, fieldErrors, error, isLoading } = useAction(createPost, {
    onSuccess: () => {
      toast.success("Post created!");
      setOpen(false);
      setTitle("");
      setBody("");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    execute({ title, body, boardId });
  };

  // If not signed in, show a sign-in button instead
  if (!isSignedIn) {
    return (
      <Button asChild>
        <Link href="/sign-in">
          <Plus className="size-4" />
          Sign in to post
        </Link>
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          New Post
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new post</DialogTitle>
          <DialogDescription>
            Share your feedback, ideas, or feature requests.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="post-title">Title</Label>
            <Input
              id="post-title"
              placeholder="Short, descriptive title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-invalid={!!fieldErrors?.title}
              aria-describedby={
                fieldErrors?.title ? "title-error" : undefined
              }
              disabled={isLoading}
            />
            {fieldErrors?.title && (
              <p id="title-error" className="text-sm text-destructive">
                {fieldErrors.title[0]}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="post-body">Description</Label>
            <Textarea
              id="post-body"
              placeholder="Describe your idea or feedback in detail..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              aria-invalid={!!fieldErrors?.body}
              aria-describedby={fieldErrors?.body ? "body-error" : undefined}
              disabled={isLoading}
              className="min-h-[120px]"
            />
            {fieldErrors?.body && (
              <p id="body-error" className="text-sm text-destructive">
                {fieldErrors.body[0]}
              </p>
            )}
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Post"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
