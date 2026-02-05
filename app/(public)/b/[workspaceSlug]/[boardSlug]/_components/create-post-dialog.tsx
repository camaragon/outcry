"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Plus, ArrowUpRight, ChevronUp, Loader2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { useAction } from "@/hooks/use-action";
import { createPost } from "@/actions/create-post";
import { STATUS_LABELS, type PostStatus } from "@/lib/post-statuses";

interface SimilarPost {
  id: string;
  title: string;
  body: string;
  voteCount: number;
  status: string;
  similarity: number;
}

interface CreatePostDialogProps {
  boardId: string;
  isSignedIn: boolean;
  workspaceSlug: string;
  boardSlug: string;
}

export function CreatePostDialog({
  boardId,
  isSignedIn,
  workspaceSlug,
  boardSlug,
}: CreatePostDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [similarPosts, setSimilarPosts] = useState<SimilarPost[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const router = useRouter();

  const { execute, fieldErrors, error, isLoading } = useAction(createPost, {
    onSuccess: () => {
      toast.success("Post created!");
      setOpen(false);
      setTitle("");
      setBody("");
      setSimilarPosts([]);
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) {
      setTitle("");
      setBody("");
      setSimilarPosts([]);
      setIsSearching(false);
    }
  };

  const searchSimilarPosts = useCallback(
    async (searchTitle: string, signal: AbortSignal) => {
      if (searchTitle.length < 5) {
        setSimilarPosts([]);
        return;
      }

      setIsSearching(true);
      try {
        const res = await fetch("/api/similar-posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: searchTitle, boardId }),
          signal,
        });

        if (res.ok) {
          const data = await res.json();
          setSimilarPosts(data);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        // Silently fail — similar posts is a nice-to-have
      } finally {
        setIsSearching(false);
      }
    },
    [boardId],
  );

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    abortRef.current?.abort();

    if (title.length < 5) {
      setSimilarPosts([]);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    debounceTimer.current = setTimeout(() => {
      searchSimilarPosts(title, controller.signal);
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      controller.abort();
    };
  }, [title, searchSimilarPosts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    execute({ title, body, boardId });
  };

  const handleSuggestionClick = (postId: string) => {
    setOpen(false);
    router.push(`/b/${workspaceSlug}/${boardSlug}/${postId}`);
  };

  const pathname = usePathname();

  // If not signed in, show a sign-in button instead
  if (!isSignedIn) {
    return (
      <Button asChild>
        <Link href={`/sign-in?redirect_url=${encodeURIComponent(pathname)}`}>
          <Plus className="size-4" />
          Sign in to post
        </Link>
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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

            {/* Similar posts suggestions */}
            {isSearching && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                <Loader2 className="size-3 animate-spin" />
                Checking for similar posts…
              </div>
            )}
            {!isSearching && similarPosts.length > 0 && (
              <div className="rounded-md border bg-muted/50 p-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Similar posts found
                </p>
                <div className="space-y-1.5">
                  {similarPosts.map((post) => {
                    const statusInfo =
                      STATUS_LABELS[post.status as PostStatus] ??
                      STATUS_LABELS.OPEN;

                    return (
                      <button
                        key={post.id}
                        type="button"
                        onClick={() => handleSuggestionClick(post.id)}
                        className="flex w-full items-start gap-3 rounded-md p-2 text-left transition hover:bg-background"
                      >
                        <div className="flex items-center gap-1 shrink-0 pt-0.5 text-xs text-muted-foreground">
                          <ChevronUp className="size-3" />
                          <span>{post.voteCount}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">
                              {post.title}
                            </span>
                            <Badge
                              variant={statusInfo.variant}
                              className="text-[10px] shrink-0"
                            >
                              {statusInfo.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {post.body}
                          </p>
                        </div>
                        <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground mt-0.5" />
                      </button>
                    );
                  })}
                </div>
              </div>
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
