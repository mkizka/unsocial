# unsocial

無料～5ドルくらいで運用可能な個人向けActivityPubサーバー(を目指す)

Demo: https://unsocial.dev

## デプロイ手順

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/Zw0SlL?referralCode=mveF9L)

1. ↑ の Deploy on Railway をクリック
1. Deploy Now をクリック
1. Deploy をクリック
1. デプロイ完了まで待つ
1. `https://${自動生成されたサブドメイン}.up.railway.app` を開いてアクセス

## 開発手順

nodejs, mkcert, docker が必要

```sh
./scripts/setup-for-docker.sh
cp -f .env.example .env
corepack enable pnpm
pnpm i
pnpm dev
# または pnpm dev misskey で Misskey も起動
# または pnpm dev mastodon で Mastodon も起動
```

https://unsocial.localhost  
https://misskey.localhost  
https://mastodon.localhost を開く

## 開発用コマンド

```sh
pnpm all            # lint & test
pnpm build          # ビルド
pnpm dev            # 開発サーバー起動
pnpm e2e            # E2Eテスト実行(事前にセットアップが必要)
pnpm lint           # 型チェックやlint実行
pnpm storybook      # stroybook起動
pnpm test           # jest実行
pnpm test:mutation  # stryker実行
pnpm test:storybook # test-storybook実行
```

## 実装したい機能

- ✅ ログイン
- ✅ ユーザー表示
- ✅ ノート表示/投稿/削除
- ✅ ノートへのいいね/いいね解除
- ✅ フォロー/フォロー解除
- 画像の添付
- リプライ
- リツイートに相当する機能
- ブロック/ミュート
- その他SNSにあるべき様々な機能

## サポートしたい実装

- ✅ Misskey
- ✅ Mastodon
