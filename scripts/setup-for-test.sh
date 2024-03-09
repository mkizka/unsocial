#!/usr/bin/bash
set -eu

docker compose -f jest/compose.yaml up -d --wait > /dev/null 2>&1
pnpm prisma migrate deploy
