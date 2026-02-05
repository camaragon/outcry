import { z } from "zod";
import { ActionState } from "@/lib/create-safe-action";
import { CreateCategory } from "./schema";
import { Category } from "@prisma/client";

export type InputType = z.infer<typeof CreateCategory>;
export type ReturnType = ActionState<InputType, Category>;
