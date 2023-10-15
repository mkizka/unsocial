#!/usr/bin/bash

docker compose --profile "$1" up -d

pnpm dotenv -e e2e/.env.myhost -- pnpm prisma db push --skip-generate
SKIP_ENV_VALIDATION=1 E2E_DIST_DIR=build-myhost pnpm build

if [ "$1" = "unsocial" ]; then
  pnpm dotenv -e e2e/.env.remote -- pnpm prisma db push --skip-generate
  SKIP_ENV_VALIDATION=1 E2E_DIST_DIR=build-remote pnpm build
fi
