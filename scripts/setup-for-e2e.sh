#!/usr/bin/bash

docker compose up -d
pnpm dotenv -e e2e/.env.myhost -- pnpm prisma db push
pnpm dotenv -e e2e/.env.remote -- pnpm prisma db push
SKIP_ENV_VALIDATION=1 pnpm build
