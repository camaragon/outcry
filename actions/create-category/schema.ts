import { z } from "zod";

export const CreateCategory = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(50, { message: "Name must be less than 50 characters" }),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, { message: "Color must be a valid hex color" }),
  workspaceId: z.string().uuid({ message: "Invalid workspace" }),
});
