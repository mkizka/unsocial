# soshal

名前は仮

## 開発手順

pnpm が必要

```
cp -f .env.example .env
pnpm i
pnpm dev
```

http://localhost:3000 を開く

### 連合の動作確認が必要な場合

mkcert と docker が必要

```
cp -f .env.docker .env
./scripts/setup-for-docker.sh
docker compose up -d --build
```

https://soshal.localhost  
https://misskey.localhost を開く

## やること(自サーバーで確認できるもの)

- [x] 他サーバーのユーザーを表示できる
- [x] 他サーバーの新しい投稿を GTL に表示できる
- [ ] 他サーバーの新しい投稿を GTL から削除できる
- [x] 他サーバーのユーザーをフォローできる
- [x] 他サーバーのユーザーをフォロー解除できる
- [x] 他サーバーの投稿にいいねをつけられる
- [ ] 他サーバーの投稿にリプライを送れる

## やること(他サーバーで確認できるもの)

- [x] 自サーバーのユーザーを表示できる
- [x] 自サーバーの新しい投稿を GTL に表示できる
- [x] 自サーバーの新しい投稿を GTL から削除できる
- [x] 自サーバーのユーザーをフォローできる
- [x] 自サーバーのユーザーをフォロー解除きる
- [x] 自サーバーの投稿にいいねをつけられる
- [ ] 自サーバーの投稿にリプライを送れる
