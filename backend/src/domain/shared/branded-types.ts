/**
 * Branded Type の基盤
 *
 * TypeScriptの構造的型付けでは string 型同士を区別できないため、
 * Branded Type を使って FrameworkId と VersionId を型レベルで区別する。
 *
 * @example
 * const frameworkId: FrameworkId = 'xxx' as FrameworkId
 * const versionId: VersionId = 'yyy' as VersionId
 * // frameworkId = versionId // コンパイルエラー
 */

declare const brand: unique symbol;

export type Brand<T, B extends string> = T & { readonly [brand]: B };

// Framework境界のID
export type FrameworkId = Brand<string, 'FrameworkId'>;
export type FrameworkVersionId = Brand<string, 'FrameworkVersionId'>;
export type RequirementCategoryId = Brand<string, 'RequirementCategoryId'>;
export type RequirementId = Brand<string, 'RequirementId'>;
export type FrameworkControlId = Brand<string, 'FrameworkControlId'>;

// Control境界のID
export type ControlId = Brand<string, 'ControlId'>;
export type TenantId = Brand<string, 'TenantId'>;

// Evidence境界のID
export type EvidenceId = Brand<string, 'EvidenceId'>;
export type EvidenceArtifactId = Brand<string, 'EvidenceArtifactId'>;

// Policy境界のID
export type PolicyId = Brand<string, 'PolicyId'>;
export type PolicyRevisionId = Brand<string, 'PolicyRevisionId'>;
export type PolicySectionId = Brand<string, 'PolicySectionId'>;
