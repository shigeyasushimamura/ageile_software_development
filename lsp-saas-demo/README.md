# ディレクトリ構成

```
src/
├── domain/
│   ├── policy.ts       # 【LSPの肝】振る舞いの契約
│   └── user.ts         # 【Entity】識別子と状態、Policyを持つ
├── infra/
│   ├── factory.ts      # 【Reconstitution】データの復元・組み立て
│   └── repository.ts   # 【Persistence】保存と検索
└── index.ts            # 【Client】動作確認用

```
