// Stryker disable all
import { z } from "zod";

import { formatZodError } from "./formatZodError";

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  UNSOCIAL_SITE_NAME: z.string().optional(),
  UNSOCIAL_SITE_DESCRIPTION: z.string().optional(),
  UNSOCIAL_DATABASE_URL: z.string().url(),
  UNSOCIAL_LOG_LEVEL: z
    .enum(["debug", "info", "warn", "error"])
    .default(process.env.NODE_ENV === "production" ? "info" : "debug"),
  UNSOCIAL_SECRET: z.preprocess(
    (str) => (process.env.NODE_ENV === "production" ? str : "secret"),
    z.string().min(1),
  ),
  UNSOCIAL_HOST: z.preprocess(
    (str) => process.env.RAILWAY_PUBLIC_DOMAIN ?? str,
    z.string().min(1),
  ),
  UNSOCIAL_AWS_S3_PUBLIC_URL: z.preprocess(
    // UNSOCIAL_AWS_S3_PUBLIC_URLが指定されていない場合は、UNSOCIAL_AWS_ENDPOINTを使う
    (str) =>
      str ??
      process.env.UNSOCIAL_AWS_ENDPOINT +
        "/" +
        process.env.UNSOCIAL_AWS_S3_BUCKET,
    z.string().url(),
  ),
  UNSOCIAL_AWS_S3_BUCKET: z.string().min(1),
  UNSOCIAL_AWS_ENDPOINT: z.string().url(),
  UNSOCIAL_AWS_DEFAULT_REGION: z.string().min(1),
  UNSOCIAL_AWS_ACCESS_KEY_ID: z.string().min(1),
  UNSOCIAL_AWS_SECRET_ACCESS_KEY: z.string().min(1),
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
