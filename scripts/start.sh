#!/usr/bin/bash
set -eu

PRISMA_VERSION=$(jq -r '.devDependencies.prisma' package.json)
corepack enable pnpm
for i in {1..5}; do
  pnpm -s dlx "prisma@$PRISMA_VERSION" db push --skip-generate && break
  echo "Retrying..."
  sleep 1
done
node server.js
