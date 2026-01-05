import { Injectable, NotFoundException } from '@nestjs/common';
import { FrameworkId } from '../../domain/shared';
import { Framework, FrameworkRepository } from '../../domain/framework';

/**
 * Framework Command Service
 *
 * 更新系の操作を担当するアプリケーションサービス
 */
@Injectable()
export class FrameworkCommandService {
  constructor(private readonly frameworkRepository: FrameworkRepository) {}

  /**
   * 新規Frameworkを作成する
   */
  async create(command: CreateFrameworkCommand): Promise<FrameworkId> {
    const framework = Framework.create({
      name: command.name,
      description: command.description,
    });

    await this.frameworkRepository.save(framework);

    return framework.id;
  }

  /**
   * Frameworkを更新する
   */
  async update(command: UpdateFrameworkCommand): Promise<void> {
    const framework = await this.frameworkRepository.findById(command.id);

    if (!framework) {
      throw new NotFoundException(`Framework not found: ${command.id}`);
    }

    framework.update({
      name: command.name,
      description: command.description,
    });

    await this.frameworkRepository.save(framework);
  }

  /**
   * Frameworkを削除する
   */
  async delete(id: FrameworkId): Promise<void> {
    const framework = await this.frameworkRepository.findById(id);

    if (!framework) {
      throw new NotFoundException(`Framework not found: ${id}`);
    }

    await this.frameworkRepository.delete(id);
  }
}

// ========================================
// Command DTOs
// ========================================

export interface CreateFrameworkCommand {
  name: string;
  description?: string | null;
}

export interface UpdateFrameworkCommand {
  id: FrameworkId;
  name: string;
  description?: string | null;
}
