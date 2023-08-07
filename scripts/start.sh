#!/usr/bin/bash
set -eu

pnpm prisma db push --skip-generate
echo "RAILWAY_STATIC_URL: ${RAILWAY_STATIC_URL}"
NEXTAUTH_URL=https://$RAILWAY_STATIC_URL pnpm next start -p "$PORT"
