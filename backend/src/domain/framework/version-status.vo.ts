/**
 * VersionStatus Value Object
 *
 * 規格バージョンの状態を表す。
 * - DRAFT: 下書き（編集可能）
 * - ACTIVE: 有効（運用中）
 * - ARCHIVED: アーカイブ（過去版）
 *
 * 状態遷移: DRAFT → ACTIVE → ARCHIVED
 */
export const VersionStatus = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
} as const;

export type VersionStatus = (typeof VersionStatus)[keyof typeof VersionStatus];

/**
 * 文字列からVersionStatusに変換する
 * @throws Error 不正な値の場合
 */
export function toVersionStatus(value: string): VersionStatus {
  if (
    value === VersionStatus.DRAFT ||
    value === VersionStatus.ACTIVE ||
    value === VersionStatus.ARCHIVED
  ) {
    return value;
  }
  throw new Error(`Invalid VersionStatus: ${value}`);
}
