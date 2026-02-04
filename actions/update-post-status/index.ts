"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { UpdatePostStatus } from "./schema";
import { InputType, ReturnType } from "./types";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { postId, status } = data;

  // Parallelize independent calls
  const [user, post] = await Promise.all([
    currentUser(),
    db.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        board: {
          select: {
            id: true,
            workspaceId: true,
            slug: true,
            workspace: { select: { slug: true } },
          },
        },
      },
    }),
  ]);

  if (!user?.id) {
    return { error: "Unauthorized" };
  }

  if (!post) {
    return { error: "Post not found." };
  }

  // Verify the user is OWNER or ADMIN in this workspace
  const dbUser = await db.user.findFirst({
    where: {
      clerkId: user.id,
      workspaceId: post.board.workspaceId,
      role: { in: ["OWNER", "ADMIN"] },
    },
    select: { id: true },
  });

  if (!dbUser) {
    return { error: "You do not have permission to update post status." };
  }

  let updatedPost;

  try {
    updatedPost = await db.post.update({
      where: { id: postId },
      data: { status },
    });
  } catch {
    return { error: "Failed to update post status. Please try again." };
  }

  revalidatePath(`/dashboard/board/${post.board.id}`);
  revalidatePath(`/b/${post.board.workspace.slug}/${post.board.slug}`);
  return { data: updatedPost };
};

export const updatePostStatus = createSafeAction(UpdatePostStatus, handler);
