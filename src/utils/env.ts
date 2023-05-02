// Stryker disable all
import { z } from "zod";

import { formatZodError } from "./formatZodError";

const serverEnvSchema = z.object({
  POSTGRES_PRISMA_URL: z.string().url(),
  POSTGRES_URL_NON_POOLING: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"]),
  NEXTAUTH_SECRET:
    process.env.NODE_ENV === "production"
      ? z.string().min(1)
      : z.string().min(1).optional(),
  NEXTAUTH_URL: z.preprocess(
    // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
    // Since NextAuth.js automatically uses the VERCEL_URL if present.
    (str) => process.env.VERCEL_URL ?? str,
    // VERCEL_URL doesn't include `https` so it cant be validated as a URL
    process.env.VERCEL ? z.string().min(1) : z.string().url()
  ),
  HOST: z
    .string()
    .default(new URL(process.env.NEXTAUTH_URL || "http://localhost:3000").host),
  EMAIL_SERVER_USER: z.string().default("user"),
  EMAIL_SERVER_PASS: z.string().default("password"),
  EMAIL_SERVER_HOST: z.string(),
  EMAIL_SERVER_PORT: z.coerce.number(),
  EMAIL_FROM: z.string().email(),
});

let env = process.env as unknown as z.infer<typeof serverEnvSchema>;

if (!process.env.SKIP_ENV_VALIDATION) {
  const parsed = serverEnvSchema.safeParse(process.env);
  if (parsed.success === false) {
    throw new Error(
      `❌ Invalid environment variables: ${formatZodError(parsed.error)}`
    );
  }
  env = parsed.data;
}

export { env };
