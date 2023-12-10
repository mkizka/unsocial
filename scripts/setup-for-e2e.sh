#!/usr/bin/bash
set -eu

docker compose --profile "$1" up -d

pnpm dotenv -e e2e/.env.myhost -- pnpm prisma db push --skip-generate
pnpm dotenv -e e2e/.env.myhost -- ./scripts/seed.ts
E2E_DIST_DIR=.next/e2e/myhost pnpm build

if [ "$1" = "unsocial" ]; then
  pnpm dotenv -e e2e/.env.remote -- pnpm prisma db push --skip-generate
  E2E_DIST_DIR=.next/e2e/remote pnpm build
fi
