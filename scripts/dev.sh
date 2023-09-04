#!/usr/bin/bash
set -eu

docker compose up -d
pnpm prisma db push --skip-generate
pnpm -s seed
NODE_EXTRA_CA_CERTS=$(pwd)/docker/mkcert/rootCA.pem pnpm nodemon
