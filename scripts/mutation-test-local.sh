#!/usr/bin/bash
set -eu

rm -rf reports
mkdir -p reports
curl -o reports/stryker-incremental.json https://minio-s3.paas.mkizka.dev/soshal-mutation-test/main/stryker-incremental.json
pnpm stryker run
