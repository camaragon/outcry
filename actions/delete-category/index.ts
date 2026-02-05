"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getAuthorizedUser } from "@/lib/get-authorized-user";
import { createSafeAction } from "@/lib/create-safe-action";
import { DeleteCategory } from "./schema";
import { InputType, ReturnType } from "./types";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { categoryId } = data;

  const [user, category] = await Promise.all([
    currentUser(),
    db.category.findUnique({
      where: { id: categoryId },
      select: { id: true, workspaceId: true, name: true, color: true, createdAt: true, updatedAt: true },
    }),
  ]);

  if (!user?.id) {
    return { error: "Unauthorized" };
  }

  if (!category) {
    return { error: "Category not found." };
  }

  const dbUser = await getAuthorizedUser(user.id, category.workspaceId);

  if (!dbUser) {
    return { error: "You do not have permission to manage categories." };
  }

  try {
    // Unset categoryId on posts that use this category, then delete
    await db.$transaction([
      db.post.updateMany({
        where: { categoryId },
        data: { categoryId: null },
      }),
      db.category.delete({
        where: { id: categoryId },
      }),
    ]);
  } catch {
    return { error: "Failed to delete category. Please try again." };
  }

  // Revalidate all paths where categories appear
  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard", "layout");
  revalidatePath("/b", "layout");
  return { data: category };
};

export const deleteCategory = createSafeAction(DeleteCategory, handler);
