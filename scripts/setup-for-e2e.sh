#!/usr/bin/bash

docker compose up -d
pnpm dotenv -e e2e/.env.myhost -- pnpm prisma db push --skip-generate
pnpm dotenv -e e2e/.env.remote -- pnpm prisma db push --skip-generate
SKIP_ENV_VALIDATION=1 E2E_DIST_DIR=build-myhost pnpm build
SKIP_ENV_VALIDATION=1 E2E_DIST_DIR=build-remote pnpm build
