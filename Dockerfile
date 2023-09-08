# https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile
FROM node:20.6-slim AS base
WORKDIR /app
RUN apt-get update && apt-get install -y openssl \
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
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
RUN pnpm build

FROM base AS runner
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

ARG RAILWAY_STATIC_URL
ENV NEXTAUTH_URL=https://$RAILWAY_STATIC_URL
CMD ["node", "server.js"]
