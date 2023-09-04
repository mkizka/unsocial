# https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile
FROM node:20.5-slim AS base
RUN apt-get update && apt-get install -y openssl \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN corepack enable pnpm && pnpm i --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
RUN corepack enable pnpm \
  && pnpm build \
  && pnpm i --prod --ignore-scripts

FROM base AS runner
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

ARG RAILWAY_STATIC_URL
ENV NEXTAUTH_URL=https://$RAILWAY_STATIC_URL
ENV NODE_ENV=production
CMD ["node", "dist/server.js"]
