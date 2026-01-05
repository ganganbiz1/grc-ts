import { v4 as uuidv4 } from 'uuid';
import { FrameworkId } from '../shared';
import { FrameworkVersion } from './framework-version.entity';

/**
 * Framework エンティティ（集約ルート）
 *
 * 規格（SOC2、ISO27001、ISMAP等）を表すドメインモデル。
 * FrameworkVersionを子として持つ。
 */
export class Framework {
  private constructor(
    private readonly _id: FrameworkId,
    private _name: string,
    private _description: string | null,
    private readonly _versions: FrameworkVersion[],
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  // ========================================
  // Factory Methods
  // ========================================

  /**
   * 新規Frameworkを作成する
   */
  static create(params: {
    name: string;
    description?: string | null;
  }): Framework {
    const now = new Date();
    return new Framework(
      uuidv4() as FrameworkId,
      params.name,
      params.description ?? null,
      [],
      now,
      now,
    );
  }

  /**
   * 永続化されたデータからFrameworkを再構築する
   */
  static reconstruct(params: {
    id: FrameworkId;
    name: string;
    description: string | null;
    versions: FrameworkVersion[];
    createdAt: Date;
    updatedAt: Date;
  }): Framework {
    return new Framework(
      params.id,
      params.name,
      params.description,
      params.versions,
      params.createdAt,
      params.updatedAt,
    );
  }

  // ========================================
  // Getters
  // ========================================

  get id(): FrameworkId {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get description(): string | null {
    return this._description;
  }

  get versions(): ReadonlyArray<FrameworkVersion> {
    return this._versions;
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
   * Frameworkの情報を更新する
   */
  update(params: { name: string; description?: string | null }): void {
    this._name = params.name;
    this._description = params.description ?? null;
    this._updatedAt = new Date();
  }

  /**
   * 新しいVersionを追加する
   */
  addVersion(version: FrameworkVersion): void {
    // 同じバージョン番号が存在しないことを確認
    const exists = this._versions.some(
      (v) => v.versionNumber === version.versionNumber,
    );
    if (exists) {
      throw new Error(`Version ${version.versionNumber} already exists`);
    }
    this._versions.push(version);
    this._updatedAt = new Date();
  }
}
