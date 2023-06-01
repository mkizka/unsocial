# builder
FROM node:20-slim AS builder
RUN apt update && apt install -y ca-certificates
WORKDIR /app
COPY prisma ./prisma
COPY patches ./patches
COPY package.json ./
RUN corepack enable pnpm && pnpm i
COPY . .
RUN pnpm build

# runner
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# https://zenn.dev/catnose99/scraps/404b1df1941ed6
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

EXPOSE 3000
CMD npx prisma db push --skip-generate && node server.js
