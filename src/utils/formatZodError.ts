import type { z } from "zod";

// Stryker disable next-line ArrowFunction
export const formatZodError = (error: z.ZodError<unknown>) =>
  JSON.stringify(error.flatten().fieldErrors);

export const stringifyZodError = (
  error: z.ZodError<unknown>,
  data: unknown,
) => {
  return JSON.stringify({ errors: error.flatten().fieldErrors, data });
};
