#!/usr/bin/bash

docker compose up -d
pnpm dotenv -- turbo run dev
