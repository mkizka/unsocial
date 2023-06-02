# soshal

名前は仮

## 開発手順

pnpm, mkcert, docker が必要

```
./scripts/setup-for-docker.sh
cp -f .env.example .env
pnpm i
pnpm dev
```

- 開発環境
  - http://localhost:3000
- 連合の動作確認
  - https://misskey.localhost

## やること(自サーバーで確認できるもの)

- [x] 他サーバーのユーザーを表示できる
- [x] 他サーバーの新しい投稿を GTL に表示できる
- [x] 他サーバーの新しい投稿を GTL から削除できる
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
- [ ] 自サーバーの投稿にいいねをつけられる
- [ ] 自サーバーの投稿にリプライを送れる
