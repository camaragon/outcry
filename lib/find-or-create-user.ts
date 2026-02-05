import type { User as ClerkUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

import type { Role } from "@prisma/client";

type FindOrCreateResult =
  | { ok: true; id: string; role: Role }
  | { ok: false; error: string };

/**
 * Find an existing user record for a workspace, or create one
 * from the Clerk user profile. Returns the user's database id
 * or an error string.
 */
export async function findOrCreateUser(
  clerkUser: ClerkUser,
  workspaceId: string,
): Promise<FindOrCreateResult> {
  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) {
    return { ok: false, error: "No email address found on your account." };
  }

  // Schema has unique constraint on clerkId — check if this user
  // already belongs to a different workspace
  const existing = await db.user.findUnique({
    where: { clerkId: clerkUser.id },
    select: { id: true, workspaceId: true, role: true },
  });

  if (existing) {
    if (existing.workspaceId !== workspaceId) {
      return { ok: false, error: "This account is already associated with a different workspace." };
    }
    return { ok: true, id: existing.id, role: existing.role };
  }

  const created = await db.user.create({
    data: {
      clerkId: clerkUser.id,
      email,
      name:
        `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() ||
        null,
      avatarUrl: clerkUser.imageUrl,
      role: "USER",
      workspaceId,
    },
    select: { id: true, role: true },
  });

  return { ok: true, id: created.id, role: created.role };
}
