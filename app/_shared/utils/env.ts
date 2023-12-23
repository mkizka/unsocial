// Stryker disable all
import { z } from "zod";

import { formatZodError } from "./formatZodError";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"]),
  UNSOCIAL_LOG_LEVEL: z.string().optional(),
  NEXTAUTH_SECRET:
    process.env.NODE_ENV === "production"
      ? z.string().min(1)
      : z.string().min(1).optional(),
  UNSOCIAL_DOMAIN: z.preprocess(
    // RailwayのPRデプロイの場合はRAILWAY_STATIC_URLを優先する
    (str) => process.env.RAILWAY_STATIC_URL ?? str,
    z.string().min(1),
  ),
  AWS_ENDPOINT: z.string().url(),
  AWS_BUCKET: z.string().min(1),
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  DISCORD_WEBHOOK_URL: z.string().url().optional(),
});

export const env = (() => {
  if (!process.env.SKIP_ENV_VALIDATION) {
    const parsed = serverEnvSchema.safeParse(process.env);
    if (!parsed.success) {
      throw new Error(
        `❌ Invalid environment variables: ${formatZodError(parsed.error)}`,
      );
    }
    return parsed.data;
  }
  return process.env as unknown as z.infer<typeof serverEnvSchema>;
})();
