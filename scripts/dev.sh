#/usr/bin/bash

docker compose up -d
NODE_EXTRA_CA_CERTS=$(pwd)/docker/mkcert/rootCA.pem pnpm next
