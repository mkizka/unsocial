#!/usr/bin/bash
set -eu

echo 1. Remove .next/types
rm -rf .next/types

echo 2. Type checking...
pnpm tsc

echo 3. Shell script linting...
shellcheck scripts/*.sh

echo 4. Code linting...
if [ "${1:-}" = "--fix" ]; then
  pnpm knip --fix --fix-type types,exports --no-exit-code
  pnpm eslint --fix .
  pnpm prettier . --check --write
else
  pnpm knip
  pnpm eslint .
  pnpm prettier . --check
fi
