#!/usr/bin/bash
set -eu

rm -rf .next/types
pnpm tsc
shellcheck scripts/*.sh

if [ "${1:-}" = "--fix" ]; then
  pnpm next lint --fix
  pnpm prettier . --check --write
else
  pnpm next lint
  pnpm prettier . --check
fi
