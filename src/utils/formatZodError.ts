import type { z } from "zod";

// Stryker disable next-line ArrowFunction
export const formatZodError = (error: z.ZodError<unknown>) =>
  JSON.stringify(error.flatten().fieldErrors);
