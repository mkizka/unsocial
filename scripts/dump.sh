#!/usr/bin/bash
set -eu

mkdir -p ./docker/db/dumps
docker compose exec db pg_dump -U postgres -Fc "$1" > ./docker/db/dumps/"$1".dump
