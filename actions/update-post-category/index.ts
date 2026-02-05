"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getAuthorizedUser } from "@/lib/get-authorized-user";
import { createSafeAction } from "@/lib/create-safe-action";
import { UpdatePostCategory } from "./schema";
import { InputType, ReturnType } from "./types";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { postId, categoryId } = data;

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

  const dbUser = await getAuthorizedUser(user.id, post.board.workspaceId);

  if (!dbUser) {
    return { error: "You do not have permission to update post category." };
  }

  // If categoryId is provided, verify it belongs to the same workspace
  if (categoryId) {
    const category = await db.category.findFirst({
      where: { id: categoryId, workspaceId: post.board.workspaceId },
      select: { id: true },
    });

    if (!category) {
      return { error: "Category not found in this workspace." };
    }
  }

  let updatedPost;

  try {
    updatedPost = await db.post.update({
      where: { id: postId },
      data: { categoryId },
    });
  } catch {
    return { error: "Failed to update post category. Please try again." };
  }

  revalidatePath(`/dashboard/board/${post.board.id}`);
  revalidatePath(`/b/${post.board.workspace.slug}/${post.board.slug}`);
  return { data: updatedPost };
};

export const updatePostCategory = createSafeAction(
  UpdatePostCategory,
  handler,
);
