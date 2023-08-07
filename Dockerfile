# https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile
FROM node:20.5-slim AS base

FROM base AS deps
WORKDIR /app
RUN apt update && apt install -y openssl
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN corepack enable pnpm && pnpm i --frozen-lockfile

FROM base AS builder
WORKDIR /app
RUN apt update && apt install -y openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && pnpm build

FROM base AS runner
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

ARG RAILWAY_STATIC_URL
ENV NEXTAUTH_URL=https://$RAILWAY_STATIC_URL

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

ARG HOST
ENV HOST=$HOST

ARG NEXTAUTH_SECRET
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET

ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
