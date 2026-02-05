import { z } from "zod";
import { ActionState } from "@/lib/create-safe-action";
import { DeleteCategory } from "./schema";
import { Category } from "@prisma/client";

export type InputType = z.infer<typeof DeleteCategory>;
export type ReturnType = ActionState<InputType, Category>;
