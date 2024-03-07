#!/usr/bin/bash

if [ -z "$BRANCH_NAME" ]; then
  BRANCH_NAME=$(git branch --show-current)
fi
MUTATION_DIR=reports/mutation
CACHE_PATH=$MUTATION_DIR/stryker-incremental.json

rm -rf $MUTATION_DIR
mkdir -p $MUTATION_DIR

echo "pr/${BRANCH_NAME}のキャッシュファイルをダウンロード..."
curl -f --progress-bar -o $CACHE_PATH "https://gha.unsocial.dev/mutation-test/pr/$BRANCH_NAME/stryker-incremental.json"
if [ ! -f $CACHE_PATH ]; then
  echo "mainのキャッシュファイルをダウンロード..."
  curl -f --progress-bar -o $CACHE_PATH https://gha.unsocial.dev/mutation-test/main/stryker-incremental.json
fi

./scripts/setup-for-test.sh
pnpm stryker run "$@"
