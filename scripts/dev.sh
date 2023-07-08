#/usr/bin/bash
set -eux

docker compose up -d
pnpm prisma db push
NODE_EXTRA_CA_CERTS=$(pwd)/docker/mkcert/rootCA.pem pnpm next
