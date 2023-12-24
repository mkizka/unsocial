# Unsocial

<img src="screenshot1.png" width="45%" />　<img src="screenshot2.png" width="45%" />

Demo: https://unsocial.dev

## Deployment Steps

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/Du5yi-?referralCode=mveF9L)

1. Click on Deploy on Railway
2. Click "Deploy Now"
3. Configure and save config
4. Click "Deploy"
5. Wait for the deployment to finish
6. Access `https://${automatically_generated_subdomain}.up.railway.app`

## Development Steps

Requires nodejs, mkcert, docker

Setup:

```sh
./scripts/setup-for-docker.sh
cp -f .env.example .env
corepack enable pnpm
pnpm i
```

Start development:

```
pnpm dev
# or `pnpm dev misskey`
# or `pnpm dev mastodon`
# or `pnpm dev all`
```

Open:

https://unsocial.localhost  
https://misskey.localhost  
https://mastodon.localhost

## Development Commands

```sh
pnpm all            # lint & test
pnpm build          # Build
pnpm dev            # Start development server
pnpm e2e            # Run E2E tests (setup required beforehand)
pnpm lint           # Type checking and linting
pnpm storybook      # Start Storybook
pnpm test           # Run Jest
pnpm test:mutation  # Run Stryker
pnpm test:storybook # Run test-storybook
```

## Features

- ✅ Login
- ✅ User display
- ✅ Note display/posting/deletion
- ✅ Like/Unlike notes
- ✅ Follow/Unfollow
- ✅ Reply
- Attach images
- Repost
- Block/Mute
- Various other features expected in social networking sites

## Supported ActivityPub Servers

- ✅ Misskey
- ✅ Mastodon
