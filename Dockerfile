# 参考
# https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile
# https://pnpm.io/docker
FROM node:20.5-slim AS base
ENV PNPM_HOME="/pnpm"
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
RUN pnpm build \
  && pnpm prune --prod --config.ignore-scripts=true

FROM base AS runner
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.mjs ./next.config.mjs

ARG RAILWAY_STATIC_URL
ENV NEXTAUTH_URL=https://$RAILWAY_STATIC_URL
ENV NODE_ENV=production
CMD ["node", "dist/server.js"]
