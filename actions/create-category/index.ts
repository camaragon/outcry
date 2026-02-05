"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getAuthorizedUser } from "@/lib/get-authorized-user";
import { createSafeAction } from "@/lib/create-safe-action";
import { CreateCategory } from "./schema";
import { InputType, ReturnType } from "./types";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { name, color, workspaceId } = data;

  const user = await currentUser();

  if (!user?.id) {
    return { error: "Unauthorized" };
  }

  const dbUser = await getAuthorizedUser(user.id, workspaceId);

  if (!dbUser) {
    return { error: "You do not have permission to manage categories." };
  }

  let category;

  try {
    category = await db.category.create({
      data: { name, color, workspaceId },
    });
  } catch (err: unknown) {
    // Handle unique constraint violation (duplicate name in workspace)
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      err.code === "P2002"
    ) {
      return { error: "A category with this name already exists." };
    }
    return { error: "Failed to create category. Please try again." };
  }

  revalidatePath("/dashboard/categories");
  return { data: category };
};

export const createCategory = createSafeAction(CreateCategory, handler);
