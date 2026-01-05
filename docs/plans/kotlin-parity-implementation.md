# GRC TypeScript Backend - Kotlin同等エンドポイント実装計画

## 概要

TypeScript+NestJSバックエンドをKotlin+SpringBootバックエンドと同等のAPI機能に揃える。

## 現状分析

### Kotlin実装済みエンドポイント (7個)
1. `GET /api/frameworks` - 規格一覧取得 ✅ TS実装済み
2. `POST /api/frameworks` - 規格作成 ✅ TS実装済み
3. `GET /api/frameworks/{id}` - 規格詳細取得 ✅ TS実装済み
4. `PUT /api/frameworks/{id}` - 規格更新 ✅ TS実装済み
5. `DELETE /api/frameworks/{id}` - 規格削除 ✅ TS実装済み
6. `POST /api/frameworks/{id}/versions` - 版作成 ❌ **未実装**
7. `POST /api/frameworks/versions/{versionId}/activate` - 版有効化 ❌ **未実装**

### 実装が必要なエンドポイント
- `POST /frameworks/:id/versions` - 新しいバージョンを作成
- `POST /frameworks/versions/:versionId/activate` - バージョンをACTIVE状態に変更

---

## 実装計画

### Phase 1: DTO作成

#### 1.1 バージョン作成リクエストDTO
**ファイル**: `backend/src/presentation/framework/dto/create-framework-version.dto.ts` (新規)

```typescript
import { z } from 'zod';

export const CreateFrameworkVersionSchema = z.object({
  versionNumber: z.string().min(1).max(50),
  effectiveDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullish()
    .transform((val) => (val ? new Date(val) : null)),
});

export type CreateFrameworkVersionDto = z.infer<typeof CreateFrameworkVersionSchema>;
```

#### 1.2 レスポンスDTO追加
**ファイル**: `backend/src/presentation/framework/dto/framework-response.dto.ts` (修正)

追加:
```typescript
export interface FrameworkVersionIdResponseDto {
  id: string;
}
```

#### 1.3 DTOエクスポート更新
**ファイル**: `backend/src/presentation/framework/dto/index.ts` (修正)

---

### Phase 2: Repository層

#### 2.1 Repositoryインターフェース拡張
**ファイル**: `backend/src/domain/framework/framework.repository.ts` (修正)

追加メソッド:
```typescript
abstract findByVersionId(versionId: FrameworkVersionId): Promise<Framework | null>;
```

#### 2.2 Prisma Repository実装
**ファイル**: `backend/src/infrastructure/prisma/framework.repository.impl.ts` (修正)

`findByVersionId`の実装を追加

---

### Phase 3: Application層

#### 3.1 Command Service拡張
**ファイル**: `backend/src/application/framework/framework-command.service.ts` (修正)

追加コマンド:
- `CreateFrameworkVersionCommand`
- `ActivateFrameworkVersionCommand`

追加メソッド:
- `createVersion(command)` - バージョン作成
- `activateVersion(command)` - バージョン有効化

#### 3.2 Query Service拡張 (オプション)
**ファイル**: `backend/src/application/framework/framework-query.service.ts` (修正)

追加メソッド:
- `findVersionById(versionId)` - バージョン単体取得

---

### Phase 4: Presentation層

#### 4.1 Controller拡張
**ファイル**: `backend/src/presentation/framework/framework.controller.ts` (修正)

追加エンドポイント:
```typescript
@Post(':id/versions')
async createVersion(@Param('id') id, @Body() dto): Promise<FrameworkVersionIdResponseDto>

@Post('versions/:versionId/activate')
async activateVersion(@Param('versionId') versionId): Promise<FrameworkVersionSummaryDto>
```

**注意**: NestJSのルートマッチング順序に注意。`versions/:versionId/activate`は`:id`より先に定義する必要あり。

---

## 実装順序（依存関係順）

| Step | ファイル | アクション |
|------|----------|------------|
| 1 | `dto/create-framework-version.dto.ts` | 新規作成 |
| 2 | `dto/framework-response.dto.ts` | 修正 |
| 3 | `dto/index.ts` | 修正 |
| 4 | `domain/framework/framework.repository.ts` | 修正 |
| 5 | `infrastructure/prisma/framework.repository.impl.ts` | 修正 |
| 6 | `application/framework/framework-command.service.ts` | 修正 |
| 7 | `presentation/framework/framework.controller.ts` | 修正 |

---

## 既存ドメインロジック（変更不要）

以下は既に実装済み:
- `FrameworkVersion.create()` - 新規作成（初期状態DRAFT）
- `FrameworkVersion.activate()` - DRAFT→ACTIVE遷移
- `Framework.addVersion()` - バージョン追加（重複チェック付き）

---

## テスト観点

### バージョン作成 (`POST /frameworks/:id/versions`)
- [x] 正常系: 新規バージョン作成 → 201 + バージョンID
- [ ] 異常系: 存在しないFramework → 404
- [ ] 異常系: 重複バージョン番号 → 400
- [ ] 異常系: バリデーションエラー → 400

### バージョン有効化 (`POST /frameworks/versions/:versionId/activate`)
- [ ] 正常系: DRAFTをACTIVE化 → 200 + 更新後のVersion情報
- [ ] 異常系: 存在しないVersion → 404
- [ ] 異常系: 既にACTIVE → 400
- [ ] 異常系: ARCHIVED状態 → 400

---

## 修正対象ファイル一覧

| パス | 変更種別 |
|------|----------|
| `backend/src/presentation/framework/dto/create-framework-version.dto.ts` | 新規 |
| `backend/src/presentation/framework/dto/framework-response.dto.ts` | 修正 |
| `backend/src/presentation/framework/dto/index.ts` | 修正 |
| `backend/src/domain/framework/framework.repository.ts` | 修正 |
| `backend/src/infrastructure/prisma/framework.repository.impl.ts` | 修正 |
| `backend/src/application/framework/framework-command.service.ts` | 修正 |
| `backend/src/presentation/framework/framework.controller.ts` | 修正 |

---

## 見積もり

- 新規ファイル: 1
- 修正ファイル: 6
- 追加コード: 約150-200行
