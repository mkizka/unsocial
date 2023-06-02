#!/usr/bin/bash

docker compose up -d
pnpm dotenv -- turbo run db:push
pnpm dotenv -- turbo run dev
