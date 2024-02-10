## 開発手順

Node.js, mkcert, Dockerが必要です

セットアップ

```sh
./scripts/setup-for-docker.sh
cp -f .env.example .env
corepack enable pnpm
pnpm i
```

開発コマンド

```
pnpm dev
# または `pnpm dev misskey`
# または `pnpm dev mastodon`
# または `pnpm dev all`
```

以下を開いて動作確認できます

https://unsocial.localhost  
https://misskey.localhost  
https://mastodon.localhost

## その他の主要な開発コマンド

### pnpm all

lint、単体テストなどを一通り実行します。

### pnpm storybook

Storybookを開きます。

### pnpm test:mutation

ミューテーションテストを実行します。

### pnpm test:storybook

Storybook Test Runnerを実行します。pnpm allでも実行できます。
