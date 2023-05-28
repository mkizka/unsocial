// Stryker disable all
import { z } from "zod";

import { formatZodError } from "./formatZodError";

const getHostIfExists = (...keys: string[]) => {
  for (const key of keys) {
    if (process.env[key]) {
      return new URL(process.env[key]!).host;
    }
  }
  return null;
};

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"]),
  NEXTAUTH_SECRET:
    process.env.NODE_ENV === "production"
      ? z.string().min(1)
      : z.string().min(1).optional(),
  HOST: z.preprocess(
    (str) => getHostIfExists("VERCEL_URL", "NEXTAUTH_URL", "DEPLOY_URL") ?? str,
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
