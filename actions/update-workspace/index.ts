"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { InputType, ReturnType } from "./types";
import { db } from "@/lib/db";
import { getAuthorizedUser } from "@/lib/get-authorized-user";
import { createSafeAction } from "@/lib/create-safe-action";
import { UpdateWorkspace } from "./schema";

const handler = async (data: InputType): Promise<ReturnType> => {
  const user = await currentUser();

  if (!user?.id) {
    return { error: "Unauthorized" };
  }

  const { workspaceId, name } = data;

  const authorizedUser = await getAuthorizedUser(user.id, workspaceId);

  if (!authorizedUser) {
    return { error: "Workspace not found or access denied." };
  }

  let workspace;

  try {
    workspace = await db.workspace.update({
      where: { id: workspaceId },
      data: { name },
      select: { id: true, name: true },
    });
  } catch {
    return { error: "Failed to update workspace. Please try again." };
  }

  revalidatePath("/dashboard", "layout");
  revalidatePath("/b", "layout");
  return { data: workspace };
};

export const updateWorkspace = createSafeAction(UpdateWorkspace, handler);
