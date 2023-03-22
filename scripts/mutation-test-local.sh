#!/usr/bin/bash
set -eu

rm -rf reports
mkdir -p reports
curl -s -o reports/stryker-incremental.json https://minio-s3.paas.mkizka.dev/soshal-mutation-test/main/stryker-incremental.json
pnpm stryker run

rm -rf reports-main
mkdir -p reports-main/mutation
curl -s -o reports-main/mutation/mutation.json https://minio-s3.paas.mkizka.dev/soshal-mutation-test/main/mutation/mutation.json
./ci/report-mutation-test-pr.mts | npx cli-markdown
