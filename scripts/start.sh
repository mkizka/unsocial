#!/usr/bin/bash
set -eu

pnpm prisma db push --skip-generate
if [ -n "$RAILWAY_STATIC_URL" ]; then
  NEXTAUTH_URL="https://$RAILWAY_STATIC_URL"
  export NEXTAUTH_URL
fi
# prデプロイではデータベースを分ける
if [ "$RAILWAY_ENVIRONMENT" = "pr" ]; then
  DATABASE_URL="${DATABASE_URL///railway//$RAILWAY_GIT_BRANCH}"
  export DATABASE_URL
fi
pnpm next start -p "$PORT"
