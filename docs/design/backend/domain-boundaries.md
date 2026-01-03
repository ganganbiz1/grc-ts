# 境界分け設計（MVP向け）

TypeScript + NestJS + Prisma / レイヤードアーキテクチャ
MVP向けの境界分け（複雑化を避ける）

---

## 1. Bounded Context（境界）一覧

本設計は「規格カタログ（定義）」と「テナント運用（状態）」を明確に分離する。

MVPでは以下の4境界に分割する。

| # | 境界名 | モジュール | 説明 |
|---|--------|-----------|------|
| 1 | Framework | `framework` | 規格カタログ（定義） |
| 2 | Control | `control` | 運用Control（テナント状態） |
| 3 | Evidence | `evidence` | 証跡 |
| 4 | Policy | `policy` | 規程 |

### 境界の狙いは「変更頻度」と「責務」を分離すること

| 境界 | 変更頻度 | 責務 | テナント依存 |
|------|----------|------|-------------|
| Framework | 低頻度 | 参照中心 | No（共通マスタ） |
| Control | 高頻度 | 状態/責任/集計中心 | Yes |
| Evidence | 中頻度 | 保全・整合性中心 | Yes |
| Policy | 低頻度 | 改訂履歴中心 | Yes |

---

## 2. Framework（規格カタログ）

### 役割

外部規格の構造・文言・識別子を「参照用カタログ」として保持する。
テナント運用の状態（owner/status/evidence等）は一切持たない。

### 所有する概念（この境界が真実のソース）

| 概念 | 説明 |
|------|------|
| **Framework** | 例：SOC 2、ISO27001、ISMAP |
| **FrameworkVersion** | 版管理（年度・リビジョン）。すべての下位要素は必ずVersionに属する |
| **RequirementCategory** | 章・ドメイン・カテゴリ（UI表示や構造整理用） |
| **Requirement** | 規格本文上の要求（意味単位）。下位にControl定義を持つ |
| **FrameworkControl** | Requirementを満たすための規格上の実施項目定義。定義情報のみを持つ |

### FrameworkControlの属性

slugをPKにすると文言修正・翻訳・衝突で破綻するため、UUIDを主キーとする。

| 属性 | 型 | 説明 |
|------|-----|------|
| **id** | string (UUID) | 内部主キー（不変、マッピング参照用） |
| **canonicalKey** | string | 規格側の安定キー（例：`ISO27001:2022:A.5.15`、`SOC2:CC6.1`） |
| **displayCode** | string | 画面表示用の番号（例：`A.5.15`、`CC6.1`） |
| **slug** | string | URL用の表示キー（PKではない、変更可能） |
| **title** | string | タイトル・見出し |
| **text** | string | 規格本文の文言 |
| **contentHash** | string | 正規化テキストのハッシュ（差分検知補助） |
| **requirementId** | string (UUID) | 親Requirementへの参照 |
| **predecessorIds** | string[] | 前版で対応するFrameworkControlのID群（改訂引き継ぎ用） |
| **mappingPolicy** | MappingPolicy | 改訂時のマッピング移行ポリシー |

### FrameworkControlの改訂引き継ぎ

規格改訂時（例：ISO27001:2013 → ISO27001:2022）のマッピング引き継ぎは業務上の大きなペインとなる。
これを支援するため、FrameworkControlは前版との継承関係を持つ。

#### mappingPolicy の値

| 値 | 説明 |
|----|------|
| **AUTO_MIGRATE** | 既存Controlのマッピングを自動で新版に移行 |
| **MANUAL_REVIEW** | テナントに確認を促し、手動でマッピングを移行 |
| **DEPRECATED** | 廃止された要件。マッピング移行不要 |

#### 改訂時の運用フロー

1. 新FrameworkVersionをインポート
2. 各FrameworkControlに`predecessorIds`で旧版との対応を定義
3. `mappingPolicy`に基づき処理：
   - `AUTO_MIGRATE`: 既存ControlのマッピングをバッチJob等で自動移行
   - `MANUAL_REVIEW`: テナントのダッシュボードに確認タスクを表示
   - `DEPRECATED`: 対応する旧マッピングをアーカイブ/削除
4. 移行完了後、旧FrameworkVersionは参照のみ（編集不可）に設定

#### 分割・統合への対応

| ケース | 対応方法 |
|--------|----------|
| 1対1（単純改訂） | `predecessorIds`に1件設定 |
| 1対多（分割） | 複数の新FrameworkControlが同じ`predecessorId`を持つ。`MANUAL_REVIEW`推奨 |
| 多対1（統合） | `predecessorIds`に複数件設定。マッピングは和集合で移行 |

### 階層

```
Framework
└─ FrameworkVersion
    └─ RequirementCategory
        └─ Requirement
            └─ FrameworkControl（定義）
```

### この境界が持たないもの（禁止）

- status / owner / note / customFields などの運用情報
- Evidence / Policy / Test との紐づけ
- 進捗集計（Completed等のテナント依存集計）

---

## 3. Control（運用）

### 役割

Framework境界の **FrameworkControl（定義）** に対して、
テナントの運用状態を表す **Control（運用）** を管理する中核境界。

### この境界が答える問い

- このControlは今どの状態か（未着手/進行中/完了など）
- 誰が責任者か
- どの証跡（Evidence/Document）やテスト（Test）で満たしているか
- 補足情報（note/customFields）は何か

### 所有する概念

| 概念 | 説明 |
|------|------|
| **Control** | テナント固有の運用管理対象 |
| - owner | 責任者 |
| - status | 進捗（NOT_STARTED / IN_PROGRESS / COMPLETED など） |
| - note / customFields | 補足情報 |
| - 集計値 | numDocumentsPassing/Total / numTestsPassing/Total 等 |
| **ControlFrameworkMapping** | FrameworkControlとの紐づけ（多:多） |
| **ControlEvidenceMapping** | 証跡との紐づけ |
| **ControlTestMapping** | テストとの紐づけ |
| **ControlPolicyMapping** | 規程との紐づけ（必要なら） |

#### FrameworkControl と Control は多:多

- 1つの **Control（運用）** が複数の **FrameworkControl（定義）** を満たすことがある
  - 例：「バックアップポリシー」が SOC2 CC6.1 と ISO27001 A.12.3.1 の両方を満たす
- 複数規格対応時に、共通Controlの「使い回し」が可能
- 未着手も Control を作成し、`status=NOT_STARTED` 等で表現する（「未作成=未着手」は避ける）

#### 複数の管理策は Control を分割して表現しない

- 複数性は、Control に紐づく **Evidence/Test/Policy の"複数Mapping"** として表現する
- Controlの下に「サブControl」「施策」などの小要素エンティティは作らない（MVPでは）

---

## 4. Evidence（証跡）

### 役割

監査に耐える形で証跡を保全・管理する。
ファイル・URL・スナップショット等を一貫した単位で扱い、整合性情報も保持する。

### 所有する概念

| 概念 | 説明 |
|------|------|
| **Evidence** | 証跡の論理単位 |
| **EvidenceArtifact** | ファイル/URL/スナップショット等の実体 |
| **IntegrityMetadata** | hash、取得日時、サイズ等 |

### この境界が持たないもの

- 規格定義（Framework/Requirement/FrameworkControl）
- 運用状態（status/owner）
- 「この証跡がどのControlを満たすか」の判断（マッピングの所有はControl境界側）

---

## 5. Policy（規程）

### 役割

テナントの社内規程を管理し、改訂履歴を保持する（監査対応）。

### 所有する概念

| 概念 | 説明 |
|------|------|
| **Policy** | 社内規程 |
| **PolicyRevision** | 改訂・版 |
| **PolicySection** | 章・条・項 |

### この境界が持たないもの

- 規格定義
- 運用進捗（status/owner）
- Evidenceの保全

---

## 6. 境界間の関係（Context Map）

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  Framework（定義・全テナント共通）                                   │
│  └─ FrameworkControl（id: UUID）                                    │
│                                                                      │
│         │                                                            │
│         │ ControlFrameworkMapping（多:多）                          │
│         │                                                            │
│         ▼                                                            │
│  Control（運用・テナント固有）                                       │
│  └─ Control（id: UUID）                                             │
│         │                                                            │
│         ├─ ControlEvidenceMapping → Evidence                        │
│         ├─ ControlTestMapping     → (Test)                          │
│         └─ ControlPolicyMapping   → Policy                          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 7. 命名方針（チーム内の統一用）

| 用語 | 意味 | ID形式 |
|------|------|--------|
| **FrameworkControl** | 規格が定めた「定義」 | UUID |
| **Control** | テナントの「運用管理対象」 | UUID |
| **Evidence** | 「証跡（Documents）」 | UUID |
| **Requirement** | 「要求（意味単位）」 | UUID |

### チーム内共通説明文

> 「FrameworkControl は規格の定義。Control はテナントの運用管理対象。
> 1つのControlが複数のFrameworkControlを満たすことがある（多:多）。
> 複数の対策は Control に紐づく証跡・テスト・規程Mappingの集合で表す。」

---

## 8. MVPでの合意事項（実装に落とすための最小ルール）

1. **Framework と Control は別境界として分離する**

2. **FrameworkControl と Control は多:多（ControlFrameworkMappingで管理）**

3. **未着手も Control を作り status で表現する**

4. **複数の管理策は、Control ↔ Evidence/Test/Policy の複数Mappingで表現する（サブ要素は作らない）**

5. **すべてのMappingはControl境界が所有する**
   - 「このControlはどの証跡で満たされているか」というControl起点のクエリが主用途
   - 境界を増やすと実装・運用コストが上がる
   - 将来Mappingに複雑なロジック（承認フロー、有効期限等）が追加されたら境界分離を検討

6. **Mapping操作は `ControlMappingService` に集約する**
   - GRC業務はマッピングが複雑化しやすいため、早期にサービス層で抽象化する
   - 単体テストでモック化しやすくなる
   - `ControlService`がシンプルになる
   - 将来の境界分離時にも変更が容易

---

## 9. TypeScript/NestJS における言語制約と対応

### Kotlinとの主な違い

| 項目 | Kotlin | TypeScript/NestJS | 対応方針 |
|------|--------|-------------------|----------|
| **Enum** | `enum class` で豊富な機能 | `enum` は値のみ | Union型 or const objectで拡張 |
| **Data Class** | `data class` で自動生成 | なし | `class` + 手動実装 or ライブラリ |
| **Null安全** | 言語レベルで保証 | `strictNullChecks` で対応 | tsconfig.jsonで有効化必須 |
| **Value Object** | `value class` (inline class) | なし | Branded Type or classで実装 |
| **sealed class** | パターンマッチ可能 | なし | Union型 + 型ガードで代替 |
| **拡張関数** | あり | なし | ユーティリティ関数で代替 |

### TypeScript固有の対応

#### 1. Value Object（値オブジェクト）の実装

Kotlinの`value class`相当をBranded Typeで実現：

```typescript
// Branded Type パターン
type UserId = string & { readonly brand: unique symbol };
type TenantId = string & { readonly brand: unique symbol };

// ファクトリ関数
function createUserId(value: string): UserId {
  // バリデーション
  if (!value || value.length === 0) {
    throw new Error('UserId cannot be empty');
  }
  return value as UserId;
}
```

または、クラスベースで実装：

```typescript
export class UserId {
  private constructor(public readonly value: string) {}

  static create(value: string): UserId {
    if (!value) throw new Error('UserId cannot be empty');
    return new UserId(value);
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }
}
```

#### 2. Enumの拡張

TypeScriptのenumは値のみなので、メソッドが必要な場合はconst objectを使用：

```typescript
// シンプルなEnum
export enum ControlStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

// メソッドが必要な場合
export const MappingPolicy = {
  AUTO_MIGRATE: 'AUTO_MIGRATE',
  MANUAL_REVIEW: 'MANUAL_REVIEW',
  DEPRECATED: 'DEPRECATED',
} as const;

export type MappingPolicy = typeof MappingPolicy[keyof typeof MappingPolicy];

// ヘルパー関数
export function isAutoMigrate(policy: MappingPolicy): boolean {
  return policy === MappingPolicy.AUTO_MIGRATE;
}
```

#### 3. Domain Entityの基底クラス

```typescript
export abstract class Entity<T> {
  constructor(public readonly id: T) {}

  equals(other: Entity<T>): boolean {
    if (other === null || other === undefined) return false;
    return this.id === other.id;
  }
}
```

#### 4. リポジトリインターフェース

NestJSではabstract classを使用（interfaceはDIトークンにならない）：

```typescript
// Domain層（インターフェース定義）
export abstract class ControlRepository {
  abstract findById(id: string): Promise<Control | null>;
  abstract findByTenantId(tenantId: string): Promise<Control[]>;
  abstract save(control: Control): Promise<void>;
  abstract delete(id: string): Promise<void>;
}

// Infrastructure層（実装）
@Injectable()
export class PrismaControlRepository extends ControlRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<Control | null> {
    // Prisma実装
  }
}
```

---

## 10. ディレクトリ構造

```
backend/src/
├── main.ts
├── app.module.ts
│
├── domain/                          # ドメイン層（依存なし）
│   ├── framework/                   # 1. Framework（規格カタログ）
│   │   ├── entities/
│   │   │   ├── framework.entity.ts
│   │   │   ├── framework-version.entity.ts
│   │   │   ├── requirement-category.entity.ts
│   │   │   ├── requirement.entity.ts
│   │   │   └── framework-control.entity.ts
│   │   ├── value-objects/
│   │   │   └── mapping-policy.vo.ts
│   │   └── repositories/
│   │       └── framework-control.repository.ts  # abstract class
│   │
│   ├── control/                     # 2. Control（運用）
│   │   ├── entities/
│   │   │   ├── control.entity.ts
│   │   │   ├── control-framework-mapping.entity.ts
│   │   │   ├── control-evidence-mapping.entity.ts
│   │   │   ├── control-test-mapping.entity.ts
│   │   │   └── control-policy-mapping.entity.ts
│   │   ├── value-objects/
│   │   │   └── control-status.vo.ts
│   │   ├── services/
│   │   │   └── control-mapping.domain-service.ts
│   │   └── repositories/
│   │       └── control.repository.ts
│   │
│   ├── evidence/                    # 3. Evidence（証跡）
│   │   ├── entities/
│   │   │   ├── evidence.entity.ts
│   │   │   ├── evidence-artifact.entity.ts
│   │   │   └── integrity-metadata.vo.ts
│   │   └── repositories/
│   │       └── evidence.repository.ts
│   │
│   └── policy/                      # 4. Policy（規程）
│       ├── entities/
│       │   ├── policy.entity.ts
│       │   ├── policy-revision.entity.ts
│       │   └── policy-section.entity.ts
│       └── repositories/
│           └── policy.repository.ts
│
├── application/                     # アプリケーション層
│   ├── framework/
│   │   └── framework.service.ts
│   ├── control/
│   │   ├── control.service.ts
│   │   └── control-mapping.service.ts
│   ├── evidence/
│   │   └── evidence.service.ts
│   └── policy/
│       └── policy.service.ts
│
├── infrastructure/                  # インフラストラクチャ層
│   ├── prisma/
│   │   └── prisma.service.ts
│   ├── framework/
│   │   └── prisma-framework-control.repository.ts
│   ├── control/
│   │   └── prisma-control.repository.ts
│   ├── evidence/
│   │   └── prisma-evidence.repository.ts
│   └── policy/
│       └── prisma-policy.repository.ts
│
└── presentation/                    # プレゼンテーション層
    ├── framework/
    │   ├── framework.controller.ts
    │   └── dto/
    ├── control/
    │   ├── control.controller.ts
    │   └── dto/
    ├── evidence/
    │   ├── evidence.controller.ts
    │   └── dto/
    └── policy/
        ├── policy.controller.ts
        └── dto/
```

---

## 11. NestJSモジュール構成

各境界をNestJSのModuleとしてカプセル化：

```typescript
// framework.module.ts
@Module({
  providers: [
    FrameworkService,
    {
      provide: FrameworkControlRepository,
      useClass: PrismaFrameworkControlRepository,
    },
  ],
  controllers: [FrameworkController],
  exports: [FrameworkService],
})
export class FrameworkModule {}

// app.module.ts
@Module({
  imports: [
    FrameworkModule,
    ControlModule,
    EvidenceModule,
    PolicyModule,
  ],
})
export class AppModule {}
```

境界間の依存は、Module間のimport/exportで明示的に管理する。
