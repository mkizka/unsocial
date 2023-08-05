#!/usr/bin/bash
set -eu

rm -rf .next/types
pnpm tsc

if [ "${1:-}" = "--fix" ]; then
  pnpm shellcheck -f diff scripts/*.sh | patch -p 1
  pnpm next lint --fix
  pnpm prettier . --check --write
else
  pnpm shellcheck scripts/*.sh
  pnpm next lint
  pnpm prettier . --check
fi
