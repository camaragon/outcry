import { z } from "zod";

export const UpdatePostCategory = z.object({
  postId: z.string().uuid({ message: "Invalid post" }),
  categoryId: z.string().uuid({ message: "Invalid category" }).nullable(),
});
