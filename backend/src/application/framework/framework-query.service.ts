import { Injectable, NotFoundException } from '@nestjs/common';
import { FrameworkId } from '../../domain/shared';
import { Framework, FrameworkRepository } from '../../domain/framework';

/**
 * Framework Query Service
 *
 * 参照系の操作を担当するアプリケーションサービス
 */
@Injectable()
export class FrameworkQueryService {
  constructor(private readonly frameworkRepository: FrameworkRepository) {}

  /**
   * 全てのFrameworkを取得する
   */
  async findAll(): Promise<Framework[]> {
    return this.frameworkRepository.findAll();
  }

  /**
   * IDでFrameworkを取得する
   */
  async findById(id: FrameworkId): Promise<Framework> {
    const framework = await this.frameworkRepository.findById(id);

    if (!framework) {
      throw new NotFoundException(`Framework not found: ${id}`);
    }

    return framework;
  }
}
