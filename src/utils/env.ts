// Stryker disable all
import { z } from "zod";

import { formatZodError } from "./formatZodError";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"]),
  NEXTAUTH_SECRET:
    process.env.NODE_ENV === "production"
      ? z.string().min(1)
      : z.string().min(1).optional(),
  NEXTAUTH_URL:
    // next-authはVERCEL_URLがあればそれを使うので検証しない
    // https://next-auth.js.org/configuration/options#nextauth_url
    process.env.VERCEL_URL ? z.any() : z.string().url(),
  HOST: z.preprocess(
    (str) =>
      process.env.VERCEL_URL ??
      (process.env.NEXTAUTH_URL ? new URL(process.env.NEXTAUTH_URL).host : str),
    z.string().min(1)
  ),
  EMAIL_SERVER_USER: z.string().default("user"),
  EMAIL_SERVER_PASS: z.string().default("password"),
  EMAIL_SERVER_HOST: z.string(),
  EMAIL_SERVER_PORT: z.coerce.number().default(1025),
  EMAIL_FROM: z.string().email().default("from@example.com"),
});

export const env = (() => {
  if (!process.env.SKIP_ENV_VALIDATION) {
    const parsed = serverEnvSchema.safeParse(process.env);
    if (!parsed.success) {
      throw new Error(
        `❌ Invalid environment variables: ${formatZodError(parsed.error)}`
      );
    }
    return parsed.data;
  }
  return process.env as unknown as z.infer<typeof serverEnvSchema>;
})();
