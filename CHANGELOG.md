# unsocial

## 1.0.0

### Major Changes

- ca06054: v1リリース

## 0.0.49

### Patch Changes

- b739888: 不要なデータがクライアントに出ないように

## 0.0.48

### Patch Changes

- 625dcef: いいね/フォロワー一覧のスタイルを修正

## 0.0.47

### Patch Changes

- 8172fb0: warnログをSentryに送信しない

## 0.0.46

### Patch Changes

- f4f19e6: 依存関係の更新

## 0.0.45

### Patch Changes

- 9d2195e: fetchしたActivityがJSONでなかった場合に対応

## 0.0.44

### Patch Changes

- 5b3bdb7: 410エラーの場合はログを出さない

## 0.0.43

### Patch Changes

- 6ec0745: ページにtitle要素追加

## 0.0.42

### Patch Changes

- 426804e: ユーザーとノートのActivityにurl追加

## 0.0.41

### Patch Changes

- 94a2273: 依存関係の更新

## 0.0.40

### Patch Changes

- 736e8f9: 他サーバーのユーザーのsummaryを保存

## 0.0.39

### Patch Changes

- e717278: HTTPSignature検証失敗時にRSASignature2017を検証する

## 0.0.38

### Patch Changes

- 87f93cd: リレーサーバー登録機能追加

## 0.0.37

### Patch Changes

- 448a85f: 依存関係の更新

## 0.0.36

### Patch Changes

- be85fd7: sharedInbox追加
- be85fd7: 環境変数をテーブル形式で表示

## 0.0.35

### Patch Changes

- d1017bd: いいねの作成/削除に応じてDBのlikesCountを増減させる

## 0.0.34

### Patch Changes

- 73a665e: Activityが重複して配送されないように修正

## 0.0.33

### Patch Changes

- 676d66d: 非ログインを管理者ページにリダイレクト

## 0.0.32

### Patch Changes

- 98cbd4c: リポスト時にAnnounceを配送

## 0.0.31

### Patch Changes

- 8fcb029: 依存関係の更新

## 0.0.30

### Patch Changes

- efe2707: リポストボタン追加

## 0.0.29

### Patch Changes

- 427ad23: Deleteアクティビティでユーザーを削除する

## 0.0.28

### Patch Changes

- 5999c1d: すでにあるFollowが送られてきてもエラーにしない

## 0.0.27

### Patch Changes

- 9dcf62c: ノートActivityが同時に送られてもエラーにしない
- 9dcf62c: 同じURLのノートActivityを受け取った場合は保存しない

## 0.0.26

### Patch Changes

- 86a4125: Dockerイメージがリリースできなかったのを修正

## 0.0.25

### Patch Changes

- 55f4b9e: 依存関係の更新

## 0.0.24

### Patch Changes

- deb64e5: 同じURLのノートActivityを受け取った場合は新しい方で上書きするように

## 0.0.23

### Patch Changes

- 949aa8a: inboxのエラーログを調整

## 0.0.22

### Patch Changes

- 67c7bf3: 空リリース

## 0.0.21

### Patch Changes

- 9437255: 空リリース

## 0.0.20

### Patch Changes

- 0ccbb2a: Sentry導入

## 0.0.19

### Patch Changes

- 315b34a: 全体的なスタイルの調整

## 0.0.18

### Patch Changes

- 6b35cae: 依存関係の更新

## 0.0.17

### Patch Changes

- 9a5188a: shadcn/ui導入

## 0.0.16

### Patch Changes

- 730adfb: リポストをタイムラインに表示

## 0.0.15

### Patch Changes

- c244960: リファクタリング

## 0.0.14

### Patch Changes

- d591f21: 依存関係の更新

## 0.0.13

### Patch Changes

- 9bcd790: 受信したAnnounceアクティビティを保存するように

## 0.0.12

### Patch Changes

- 26b6563: ログアウト時にlocalhost:3000にリダイレクトされるのを修正

## 0.0.11

### Patch Changes

- 16dbb45: リダイレクト判定の見直し

## 0.0.10

### Patch Changes

- ab15277: アクセスログは本番環境でのみ表示する

## 0.0.9

### Patch Changes

- 20e4ea0: faviconとOGP画像設定を追加

## 0.0.8

### Patch Changes

- 0cf93ac: Activityの配送時にContent-Type: application/activity+jsonをつける

## 0.0.7

### Patch Changes

- ed9681f: リレー時のタイムアウト時間を調整

## 0.0.6

### Patch Changes

- abcd5c9: 依存関係の更新

## 0.0.5

### Patch Changes

- 5057a8f: 空リリース

## 0.0.4

### Patch Changes

- a599f14: /healthにversion追加
- cbb4848: 依存関係の更新

## 0.0.3

### Patch Changes

- 89d4abf: dockerイメージにバージョンタグがつかないのを修正

## 0.0.2

### Patch Changes

- 916583f: bump-version実行後にDockerイメージをpush

## 0.0.1

### Patch Changes

- 0e8c26e: 最初のリリース
