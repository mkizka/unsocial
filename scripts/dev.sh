#!/usr/bin/bash
set -eu

docker compose --profile "${1:-unsocial}" up -d
pnpm prisma migrate deploy
NODE_ENV=development pnpm dotenv -- ./scripts/seed.ts
NODE_EXTRA_CA_CERTS=$(pwd)/docker/mkcert/rootCA.pem pnpm next
