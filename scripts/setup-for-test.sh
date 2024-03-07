#!/usr/bin/bash
set -eu

docker compose -f jest/compose.yaml up -d --wait
pnpm prisma migrate deploy
