import { z } from "zod";

export const CreatePost = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters" })
    .max(200, { message: "Title must be less than 200 characters" }),
  body: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" })
    .max(5000, { message: "Description must be less than 5000 characters" }),
  boardId: z.string().uuid({ message: "Invalid board" }),
});
