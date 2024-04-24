# https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile
FROM node:20.12.2-slim AS base
WORKDIR /app
# https://github.com/getsentry/sentry-cli/issues/1069#issuecomment-969439768
RUN apt-get update && apt-get install -y openssl jq ca-certificates \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable pnpm

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN pnpm i --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS runner
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/scripts/start.sh ./scripts/start.sh

CMD ["./scripts/start.sh"]
