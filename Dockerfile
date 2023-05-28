# deps
FROM node:18-slim AS deps
WORKDIR /app
COPY prisma ./prisma
COPY patches ./patches
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm i

# builder
FROM node:18-slim AS builder
WORKDIR /app
RUN apt update && apt install -y ca-certificates
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && pnpm build

# runner
FROM node:18-slim AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/next.config.mjs ./
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# https://zenn.dev/catnose99/scraps/404b1df1941ed6
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

USER nextjs
EXPOSE 3000

CMD npx prisma db push && node server.js
