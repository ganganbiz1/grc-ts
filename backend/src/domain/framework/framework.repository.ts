import { FrameworkId } from '../shared';
import { Framework } from './framework.entity';

/**
 * Framework Repository Interface
 *
 * Domain層で定義し、Infrastructure層で実装する（依存性逆転の原則）
 */
export abstract class FrameworkRepository {
  /**
   * IDでFrameworkを取得する
   */
  abstract findById(id: FrameworkId): Promise<Framework | null>;

  /**
   * 全てのFrameworkを取得する
   */
  abstract findAll(): Promise<Framework[]>;

  /**
   * Frameworkを保存する（新規作成・更新両方）
   */
  abstract save(framework: Framework): Promise<void>;

  /**
   * Frameworkを削除する
   */
  abstract delete(id: FrameworkId): Promise<void>;
}
