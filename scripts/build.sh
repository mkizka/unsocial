#!/usr/bin/bash
set -eu

if [ -n "${DATABASE_URL:-}" ]; then
  pnpm prisma migrate deploy
fi
SKIP_ENV_VALIDATION=1 pnpm next build
