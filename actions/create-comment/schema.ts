import { z } from "zod";

export const CreateComment = z.object({
  body: z
    .string()
    .min(1, { message: "Comment cannot be empty" })
    .max(5000, { message: "Comment must be less than 5000 characters" }),
  postId: z.string().uuid({ message: "Invalid post" }),
});
