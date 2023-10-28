#!/usr/bin/bash
set -eu

if [ -n "${DATABASE_URL:-}" ]; then
  for i in $(seq 1 10); do
    echo 'SELECT 1' | pnpm prisma db execute --stdin 1> /dev/null 2>&1 && break
    echo "Waiting for database to be ready... ($i)"
    sleep 2
  done
  pnpm prisma db push --skip-generate
fi
SKIP_ENV_VALIDATION=1 pnpm next build
