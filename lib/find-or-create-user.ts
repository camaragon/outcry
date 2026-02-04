import type { User as ClerkUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

/**
 * Find an existing user record for a workspace, or create one
 * from the Clerk user profile. Returns the user's database id.
 */
export async function findOrCreateUser(
  clerkUser: ClerkUser,
  workspaceId: string,
): Promise<{ id: string }> {
  const existing = await db.user.findFirst({
    where: { clerkId: clerkUser.id, workspaceId },
    select: { id: true },
  });

  if (existing) return existing;

  return db.user.create({
    data: {
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      name:
        `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() ||
        null,
      avatarUrl: clerkUser.imageUrl,
      role: "USER",
      workspaceId,
    },
    select: { id: true },
  });
}
