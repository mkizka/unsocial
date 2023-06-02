#!/usr/bin/bash

NODE_EXTRA_CA_CERTS="$(pwd)/docker/mkcert/rootCA.pem"
export NODE_EXTRA_CA_CERTS

docker compose up -d
pnpm dotenv -- turbo run dev
