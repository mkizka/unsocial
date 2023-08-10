#!/usr/bin/bash
set -eu

docker compose up -d
pnpm prisma migrate deploy
NODE_EXTRA_CA_CERTS=$(pwd)/docker/mkcert/rootCA.pem pnpm next
