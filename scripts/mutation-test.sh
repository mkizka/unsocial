#!/usr/bin/bash
set -eu

BRANCH_NAME=$(git branch --show-current)

mkdir -p reports
echo "$BRANCH_NAME のキャッシュファイルをダウンロード..."
curl -fs -o reports/stryker-incremental.json "https://minio-s3.paas.mkizka.dev/soshal-mutation-test/$BRANCH_NAME/stryker-incremental.json"
if [ ! -f reports/stryker-incremental.json ]; then
  echo "main のキャッシュファイルをダウンロード..."
  curl -fs -o reports/stryker-incremental.json https://minio-s3.paas.mkizka.dev/soshal-mutation-test/main/stryker-incremental.json
fi
pnpm stryker run "$@"
