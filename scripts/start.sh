#!/usr/bin/bash
set -eu

PRISMA_VERSION=$(jq -r '.devDependencies.prisma' package.json)
corepack enable pnpm
pnpm -s dlx "prisma@$PRISMA_VERSION" db push --skip-generate
node server.js
