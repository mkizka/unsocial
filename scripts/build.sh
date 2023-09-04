#!/usr/bin/bash
set -eu

if [ -n "${DATABASE_URL:-}" ]; then
  pnpm prisma db push --skip-generate
fi
SKIP_ENV_VALIDATION=1 pnpm next build
pnpm tsc --project tsconfig.server.json
