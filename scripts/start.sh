#!/usr/bin/bash
set -eu

PRISMA_VERSION=$(jq -r '.devDependencies.prisma' package.json)
corepack enable pnpm
for _ in {1..5}; do
  pnpm -s dlx "prisma@$PRISMA_VERSION" db push --skip-generate && break
  echo "Retrying..."
  sleep 1
done
VERSION=$(jq -r '.version' package.json)
SENTRY_RELEASE=v$VERSION node server.js
