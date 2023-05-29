# builder
FROM node:18-slim AS builder
RUN apt update && apt install -y ca-certificates
WORKDIR /app
COPY prisma ./prisma
COPY patches ./patches
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm i
COPY . .
RUN pnpm build &&\
  rm -rf node_modules &&\
  pnpm i --prod --ignore-scripts

# runner
FROM node:18-slim AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
# https://zenn.dev/catnose99/scraps/404b1df1941ed6
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

EXPOSE 3000
CMD npm start
