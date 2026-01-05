import { v4 as uuidv4 } from 'uuid';
import { FrameworkId, FrameworkVersionId } from '../shared';
import { VersionStatus } from './version-status.vo';

/**
 * FrameworkVersion エンティティ
 *
 * 規格のバージョン（版）を表すドメインモデル。
 * 状態遷移ロジックを持つ。
 */
export class FrameworkVersion {
  private constructor(
    private readonly _id: FrameworkVersionId,
    private readonly _frameworkId: FrameworkId,
    private readonly _versionNumber: string,
    private _status: VersionStatus,
    private _effectiveDate: Date | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  // ========================================
  // Factory Methods
  // ========================================

  /**
   * 新規FrameworkVersionを作成する（初期状態はDRAFT）
   */
  static create(params: {
    frameworkId: FrameworkId;
    versionNumber: string;
    effectiveDate?: Date | null;
  }): FrameworkVersion {
    const now = new Date();
    return new FrameworkVersion(
      uuidv4() as FrameworkVersionId,
      params.frameworkId,
      params.versionNumber,
      VersionStatus.DRAFT,
      params.effectiveDate ?? null,
      now,
      now,
    );
  }

  /**
   * 永続化されたデータからFrameworkVersionを再構築する
   */
  static reconstruct(params: {
    id: FrameworkVersionId;
    frameworkId: FrameworkId;
    versionNumber: string;
    status: VersionStatus;
    effectiveDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): FrameworkVersion {
    return new FrameworkVersion(
      params.id,
      params.frameworkId,
      params.versionNumber,
      params.status,
      params.effectiveDate,
      params.createdAt,
      params.updatedAt,
    );
  }

  // ========================================
  // Getters
  // ========================================

  get id(): FrameworkVersionId {
    return this._id;
  }

  get frameworkId(): FrameworkId {
    return this._frameworkId;
  }

  get versionNumber(): string {
    return this._versionNumber;
  }

  get status(): VersionStatus {
    return this._status;
  }

  get effectiveDate(): Date | null {
    return this._effectiveDate;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // ========================================
  // Domain Logic
  // ========================================

  /**
   * DRAFTからACTIVEに状態遷移する
   * @throws Error DRAFT以外の状態から呼び出した場合
   */
  activate(): void {
    if (this._status !== VersionStatus.DRAFT) {
      throw new Error(
        `Cannot activate version in ${this._status} status. Only DRAFT can be activated.`,
      );
    }
    this._status = VersionStatus.ACTIVE;
    this._updatedAt = new Date();
  }

  /**
   * ACTIVEからARCHIVEDに状態遷移する
   * @throws Error ACTIVE以外の状態から呼び出した場合
   */
  archive(): void {
    if (this._status !== VersionStatus.ACTIVE) {
      throw new Error(
        `Cannot archive version in ${this._status} status. Only ACTIVE can be archived.`,
      );
    }
    this._status = VersionStatus.ARCHIVED;
    this._updatedAt = new Date();
  }

  /**
   * 編集可能かどうか（DRAFTのみ編集可能）
   */
  isEditable(): boolean {
    return this._status === VersionStatus.DRAFT;
  }
}
