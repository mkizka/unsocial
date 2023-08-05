#!/usr/bin/bash

if [ -z "$BRANCH_NAME" ]; then
  BRANCH_NAME=$(git branch --show-current)
fi
MUTATION_DIR=reports/mutation
CACHE_PATH=$MUTATION_DIR/stryker-incremental.json

rm -rf $MUTATION_DIR
mkdir -p $MUTATION_DIR

echo "$BRANCH_NAME のキャッシュファイルをダウンロード..."
curl -f --progress-bar -o $CACHE_PATH "https://minio-s3.paas.mkizka.dev/soshal-gha/mutation-test/$BRANCH_NAME/stryker-incremental.json"
if [ ! -f $CACHE_PATH ]; then
  echo "main のキャッシュファイルをダウンロード..."
  curl -f --progress-bar -o $CACHE_PATH https://minio-s3.paas.mkizka.dev/soshal-gha/mutation-test/main/stryker-incremental.json
fi
if [ ! -f $CACHE_PATH ]; then
  echo "キャッシュファイルが取得できませんでした"
  exit 1
fi

pnpm stryker run "$@"
