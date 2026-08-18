import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

export type ProjectInput = z.infer<typeof projectSchema>;
