FROM node:20-slim AS base

# setup
FROM base AS setup
RUN apt update && apt install -y ca-certificates
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN corepack enable pnpm && turbo prune --scope=@soshal/web --docker

# builder
FROM base AS builder
WORKDIR /app
COPY --from=setup /app/out/json/ .
COPY --from=setup /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN corepack enable pnpm && pnpm i
COPY --from=setup /app/out/full/ .
RUN pnpm build --filter=@soshal/web

# runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
# https://zenn.dev/catnose99/scraps/404b1df1941ed6
COPY --from=setup /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

EXPOSE 3000
CMD node apps/web/server.js
