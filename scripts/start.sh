#!/usr/bin/bash
set -eu

pnpm prisma db push --skip-generate
NEXTAUTH_URL=https://$RAILWAY_STATIC_URL pnpm next start -p "$PORT"
