import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { CommentList } from "./comment-list";
import { CommentForm } from "./comment-form";

interface CommentsSectionProps {
  postId: string;
  currentPath: string;
}

export async function CommentsSection({
  postId,
  currentPath,
}: CommentsSectionProps) {
  const [comments, { userId }] = await Promise.all([
    db.comment.findMany({
      where: { postId },
      orderBy: { createdAt: "asc" },
      include: {
        author: { select: { name: true, email: true } },
      },
    }),
    auth(),
  ]);

  const isSignedIn = !!userId;

  return (
    <>
      <CommentList comments={comments} />

      <div className="mt-6">
        {isSignedIn ? (
          <CommentForm postId={postId} />
        ) : (
          <div className="rounded-lg border border-dashed p-4 text-center">
            <p className="text-sm text-muted-foreground">
              <Button variant="link" className="h-auto p-0" asChild>
                <Link
                  href={`/sign-in?redirect_url=${encodeURIComponent(currentPath)}`}
                >
                  Sign in
                </Link>
              </Button>{" "}
              to leave a comment
            </p>
          </div>
        )}
      </div>
    </>
  );
}
