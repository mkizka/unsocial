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

- pnpm all
  - lint、テスト、スナップショット更新を一通り実行します。
- pnpm down
  - devコマンドと単体テストで使用するdocker composeをまとめてdownします。
  - pnpm down -v でボリュームも削除します。
- pnpm test:mutation
  - ミューテーションテストを実行します。
  - GitHub Actionsでも実行されますが、スコアは参考程度です。
