# unsocial

無料～5ドルくらいで運用可能な個人向けActivityPubサーバー(を目指す)

## 開発手順

pnpm, mkcert, docker が必要

```
./scripts/setup-for-docker.sh
cp -f .env.example .env
pnpm i
pnpm dev
```

https://unsocial.localhost  
https://misskey.localhost  
https://mastodon.localhost を開く

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
- Mastodon
