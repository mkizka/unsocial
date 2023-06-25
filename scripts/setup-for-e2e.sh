#!/usr/bin/bash

docker compose up -d
pnpm dotenv -e e2e/.env.myhost -- pnpm prisma db push --skip-generate
pnpm dotenv -e e2e/.env.remote -- pnpm prisma db push --skip-generate
SKIP_ENV_VALIDATION=1 pnpm build
