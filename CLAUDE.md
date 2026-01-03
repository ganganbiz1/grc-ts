# CLAUDE.md

このファイルはClaude Codeがプロジェクトで作業する際のルールとコンテキストを提供します。

## 重要: npm/npxコマンドの実行ルール

**npm/npxコマンドは必ずDockerコンテナ内で実行すること。ローカルで直接実行しない。**

```bash
# NG: ローカルで直接実行
npm install xxx
npx prisma migrate dev

# OK: docker compose exec 経由で実行
docker compose exec backend npm install xxx
docker compose exec frontend npm install xxx
docker compose exec backend npx prisma migrate dev
```

理由:
- node_modulesがDockerコンテナ内のボリュームにマウントされている
- 環境依存の問題を避けるため

## 開発コマンド

Docker操作は必ずMakefileのコマンドを使用すること:

```bash
make up           # 全サービス起動
make up-build     # リビルドして起動
make down         # サービス停止
make restart      # 再起動
make logs         # ログ確認
make ps           # コンテナ状態確認
make db           # DBのみ起動
make clean        # 停止 + ボリューム削除
```

## データベース操作

```bash
make migrate              # マイグレーション実行
make migrate-create NAME=xxx  # 新規マイグレーション作成
make migrate-reset        # DBリセット + 全マイグレーション再実行
make prisma-studio        # Prisma Studio（DB GUI）起動
```

## アーキテクチャ

- レイヤードアーキテクチャ + DDD
- バックエンド構成: presentation → application → domain ← infrastructure
- Domain層は他の層に依存しない（依存性逆転の原則）

## 技術スタック

- バックエンド: NestJS 11 (TypeScript)
- フロントエンド: Next.js 16 + React 19
- ORM: Prisma 6
- データベース: PostgreSQL 17

## ポート構成

- frontend: 3000
- backend: 3001
- PostgreSQL: 15432（ホスト側）
