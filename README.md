# GRC TypeScript

GRC（Governance, Risk, Compliance）SaaSアプリケーション。

## 技術スタック

| 項目 | 技術 | 説明 |
|------|------|------|
| 言語 | TypeScript 5.x | JavaScriptに静的型付けを追加した言語 |
| バックエンド | NestJS 11 | Node.js上で動作するサーバーサイドフレームワーク |
| フロントエンド | Next.js 16 | Reactベースのフルスタックフレームワーク |
| UIライブラリ | React 19 | コンポーネントベースのUIライブラリ |
| スタイリング | Tailwind CSS 4 | ユーティリティファーストのCSSフレームワーク |
| データベース | PostgreSQL 17 | オープンソースのリレーショナルDB |
| ORM | Prisma 6 | 型安全なデータベースクライアント |
| ランタイム | Node.js 22 | JavaScript実行環境 |

---

## プロジェクト構造

```
grc-ts/
├── docker-compose.yml    # ローカル開発環境
├── Makefile              # よく使うコマンドのショートカット
├── backend/              # NestJS バックエンド
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── main.ts       # エントリーポイント
│       └── app.module.ts # ルートモジュール
└── frontend/             # Next.js フロントエンド
    ├── Dockerfile
    ├── package.json
    ├── next.config.ts
    └── app/              # App Router（ページ定義）
```

---

## アーキテクチャ

### レイヤードアーキテクチャ + DDD

バックエンドは**レイヤードアーキテクチャ**で構築します。

```
backend/src/
├── main.ts                    # エントリーポイント
├── app.module.ts              # ルートモジュール
│
├── presentation/              # プレゼンテーション層
│   ├── controllers/           # HTTPリクエスト処理
│   └── dtos/                  # リクエスト/レスポンスDTO
│
├── application/               # アプリケーション層
│   ├── services/              # ユースケース
│   └── ports/                 # 入出力ポート（インターフェース）
│
├── domain/                    # ドメイン層
│   ├── entities/              # エンティティ
│   ├── value-objects/         # 値オブジェクト
│   ├── repositories/          # リポジトリインターフェース
│   └── services/              # ドメインサービス
│
└── infrastructure/            # インフラストラクチャ層
    ├── repositories/          # リポジトリ実装
    ├── database/              # DB設定、マイグレーション
    └── external/              # 外部API連携
```

### 各層の責務

| 層 | 責務 | 依存方向 |
|----|------|----------|
| Presentation | HTTP処理、バリデーション | → Application |
| Application | ユースケース、トランザクション | → Domain |
| Domain | ビジネスルール、エンティティ | 依存なし（中心） |
| Infrastructure | DB、外部API | → Domain |

### 依存関係のルール

```
┌─────────────────────────────────────────┐
│           Presentation 層               │
│  (Controller, DTO)                      │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│           Application 層                │
│  (UseCase, ApplicationService)          │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│             Domain 層                   │
│  (Entity, ValueObject, Repository IF)   │
└─────────────────────────────────────────┘
                    ↑
┌─────────────────────────────────────────┐
│         Infrastructure 層               │
│  (Repository実装, DB, 外部API)           │
└─────────────────────────────────────────┘

※ 矢印は依存の方向。Domain層は他の層に依存しない。
```

---

## ローカル開発環境

### 前提条件

- Docker Desktop がインストールされていること

### 起動方法

```bash
# 全サービス起動（frontend + backend + db）
make up

# 初回または Dockerfile 変更時
make up-build
```

### 動作確認

```bash
# フロントエンド
open http://localhost:3000

# バックエンド
curl http://localhost:3001

# PostgreSQL接続
docker exec -it grc-ts-db-1 psql -U grc -d grc
```

### 停止

```bash
make down

# ボリュームも削除（DBデータも消える）
make clean
```

---

## Makefile コマンド一覧

| コマンド | 説明 |
|----------|------|
| `make up` | 全サービス起動（frontend + backend + db） |
| `make up-build` | イメージを再ビルドして起動 |
| `make down` | 全サービス停止 |
| `make restart` | 再起動 |
| `make logs` | ログ表示（リアルタイム） |
| `make ps` | コンテナ状態確認 |
| `make db` | DBのみ起動 |
| `make clean` | 停止 + ボリューム削除 |
| `make migrate` | マイグレーション実行 |
| `make migrate-create NAME=xxx` | 新規マイグレーション作成 |
| `make migrate-reset` | DBリセット + 全マイグレーション実行 |
| `make prisma-studio` | Prisma Studio（DB GUI）起動 |

---

## ポート構成

| サービス | ポート | 説明 |
|----------|--------|------|
| frontend | 3000 | Next.js（ブラウザからアクセス） |
| backend | 3001 | NestJS API |
| db | 15432 | PostgreSQL（ホスト側） |

---

## 開発ワークフロー

### 1. コードを編集

`make up` で起動した状態でコードを編集すると、自動的に変更が反映されます（ホットリロード）。

### 2. ログを確認

```bash
# 全サービスのログ
make logs

# バックエンドのみ
docker compose logs -f backend
```

### 3. DBに接続

```bash
# psql で接続
docker exec -it grc-ts-db-1 psql -U grc -d grc

# テーブル一覧
\dt

# 終了
\q
```

---

## Prisma（データベース）

### Prisma とは？

**Prisma**は、Node.js/TypeScript向けの型安全なORMです。

Goの`sqlc`や`ent`に近い立ち位置で、スキーマ定義からクライアントコードを自動生成します。

### ファイル構成

```
backend/
├── prisma/
│   ├── schema.prisma      # スキーマ定義
│   └── migrations/        # マイグレーションファイル
├── prisma.config.ts       # Prisma設定
└── .env                   # DATABASE_URL
```

### schema.prisma の書き方

```prisma
// モデル定義（Goのstructに相当）
model User {
  id        String   @id @default(uuid())  // 主キー、UUID自動生成
  email     String   @unique               // ユニーク制約
  name      String
  posts     Post[]                         // リレーション（1対多）
  createdAt DateTime @default(now()) @map("created_at")  // カラム名をスネークケースに

  @@map("users")  // テーブル名をスネークケースに
}

model Post {
  id       String @id @default(uuid())
  title    String
  authorId String @map("author_id")
  author   User   @relation(fields: [authorId], references: [id])

  @@map("posts")
}
```

### よく使うコマンド

```bash
# マイグレーション作成 + 適用（開発時）
make migrate-create NAME=add_posts_table

# マイグレーション適用のみ（本番デプロイ時）
make migrate

# DBリセット（全データ削除 + マイグレーション再実行）
make migrate-reset

# Prisma Studio起動（ブラウザでDBを確認・編集）
make prisma-studio
```

### Prisma Client の使い方

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 作成
const user = await prisma.user.create({
  data: {
    email: 'alice@example.com',
    name: 'Alice',
  },
});

// 検索
const users = await prisma.user.findMany({
  where: { name: { contains: 'Ali' } },
});

// 更新
await prisma.user.update({
  where: { id: 'xxx' },
  data: { name: 'Alice Updated' },
});

// 削除
await prisma.user.delete({
  where: { id: 'xxx' },
});
```

---

## 次のステップ

1. **バックエンドのディレクトリ構造作成** - レイヤードアーキテクチャに沿った構造
2. **エンティティ作成** - ドメインモデルの定義
3. **API実装** - コントローラー、サービスの実装
4. **フロントエンド実装** - 画面の作成

---

## 参考リンク

- [TypeScript公式ドキュメント](https://www.typescriptlang.org/docs/)
- [NestJS公式ドキュメント](https://docs.nestjs.com/)
- [Next.js公式ドキュメント](https://nextjs.org/docs)
- [React公式ドキュメント](https://react.dev/)
- [Tailwind CSS公式ドキュメント](https://tailwindcss.com/docs)
- [Prisma公式ドキュメント](https://www.prisma.io/docs)
