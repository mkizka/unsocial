FROM node:18-slim AS deps
WORKDIR /app
COPY prisma ./prisma
COPY patches ./patches
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm i
CMD pnpm prisma migrate deploy && pnpm next dev
