#!/usr/bin/bash
set -eu

docker compose --profile "${1:-unsocial}" up -d
pnpm prisma db push --skip-generate
pnpm -s seed
NODE_EXTRA_CA_CERTS=$(pwd)/docker/mkcert/rootCA.pem pnpm next
