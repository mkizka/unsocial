#!/usr/bin/bash
set -eu

docker compose -f ./jest/compose.yaml down -v
for profile in all unsocial mastodon misskey; do
  docker compose --profile "${profile}" down --remove-orphans "$@"
done
