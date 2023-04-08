#!/usr/bin/bash

if [ -z $BRANCH_NAME ]; then
  BRANCH_NAME=$(git branch --show-current)
fi
rm -rf reports
mkdir -p reports
echo "$BRANCH_NAME のキャッシュファイルをダウンロード..."
curl -fs -o reports/stryker-incremental.json "https://minio-s3.paas.mkizka.dev/soshal-mutation-test/$BRANCH_NAME/stryker-incremental.json"
if [ ! -f reports/stryker-incremental.json ]; then
  echo "main のキャッシュファイルをダウンロード..."
  curl -fs -o reports/stryker-incremental.json https://minio-s3.paas.mkizka.dev/soshal-mutation-test/main/stryker-incremental.json
fi
if [ ! -f reports/stryker-incremental.json ]; then
  echo "キャッシュファイルが取得できませんでした"
  exit 1;
fi
pnpm stryker run "$@"
