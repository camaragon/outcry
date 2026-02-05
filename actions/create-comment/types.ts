import { z } from "zod";
import { ActionState } from "@/lib/create-safe-action";
import { CreateComment } from "./schema";
import { Comment } from "@prisma/client";

export type InputType = z.infer<typeof CreateComment>;
export type ReturnType = ActionState<InputType, Comment>;
