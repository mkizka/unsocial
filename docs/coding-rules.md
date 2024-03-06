# コーディングルール

## ディレクトリ構造

ディレクトリ構造には可能な限りコロケーションを採用します。

ある実装が特定の1つの機能でのみ使用される場合はその機能の出来るだけ近くに配置します。

例：/settingsページの場合

```
app/settings
├── _components
│   ├── EnvironmentInfo
│   │   └── index.tsx
│   ├── IconSettingsForm
│   │   ├── IconFileInput
│   │   └── index.tsx
│   ├── ProfileFormContainer
│   │   ├── ProfileForm
│   │   ├── action.ts
│   │   └── index.tsx
│   ├── RelayServer
│   │   ├── RelayServerForm
│   │   ├── RelayServerTable
│   │   └── index.tsx
│   ├── SettingHeader
│   │   └── index.tsx
│   └── SignoutForm
│       └── index.tsx
└── page.tsx
```

2つ以上の機能で使用する場合は`app/_shared`ディレクトリに配置します。

## エラーハンドリング
