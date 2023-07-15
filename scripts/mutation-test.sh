#!/usr/bin/bash
set -eu

./scripts/mutation/download.sh
./scripts/mutation/prepare.ts
pnpm stryker run "$@"
