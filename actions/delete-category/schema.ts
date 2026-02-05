import { z } from "zod";

export const DeleteCategory = z.object({
  categoryId: z.string().uuid({ message: "Invalid category" }),
});
