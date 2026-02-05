import { z } from "zod";

export const CreateComment = z.object({
  body: z
    .string()
    .min(3, { message: "Comment must be at least 3 characters" })
    .max(2000, { message: "Comment must be less than 2000 characters" }),
  postId: z.string().uuid({ message: "Invalid post" }),
});
