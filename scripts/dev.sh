#!/usr/bin/bash
set -eu

docker compose --profile unsocial up -d
pnpm prisma db push --skip-generate
pnpm seed
NODE_EXTRA_CA_CERTS=$(pwd)/docker/mkcert/rootCA.pem pnpm next
