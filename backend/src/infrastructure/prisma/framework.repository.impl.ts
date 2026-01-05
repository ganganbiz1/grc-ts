import { Injectable } from '@nestjs/common';
import { FrameworkId, FrameworkVersionId } from '../../domain/shared';
import {
  Framework,
  FrameworkVersion,
  FrameworkRepository,
  toVersionStatus,
} from '../../domain/framework';
import { PrismaService } from './prisma.service';

/**
 * Framework Repository の Prisma 実装
 */
@Injectable()
export class PrismaFrameworkRepository extends FrameworkRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: FrameworkId): Promise<Framework | null> {
    const record = await this.prisma.framework.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!record) {
      return null;
    }

    return this.toDomain(record);
  }

  async findAll(): Promise<Framework[]> {
    const records = await this.prisma.framework.findMany({
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record) => this.toDomain(record));
  }

  async save(framework: Framework): Promise<void> {
    await this.prisma.framework.upsert({
      where: { id: framework.id },
      create: {
        id: framework.id,
        name: framework.name,
        description: framework.description,
        createdAt: framework.createdAt,
        updatedAt: framework.updatedAt,
      },
      update: {
        name: framework.name,
        description: framework.description,
        updatedAt: framework.updatedAt,
      },
    });

    // Versionsの保存
    for (const version of framework.versions) {
      await this.prisma.frameworkVersion.upsert({
        where: { id: version.id },
        create: {
          id: version.id,
          frameworkId: version.frameworkId,
          version: version.versionNumber,
          status: version.status,
          effectiveDate: version.effectiveDate,
          createdAt: version.createdAt,
          updatedAt: version.updatedAt,
        },
        update: {
          version: version.versionNumber,
          status: version.status,
          effectiveDate: version.effectiveDate,
          updatedAt: version.updatedAt,
        },
      });
    }
  }

  async delete(id: FrameworkId): Promise<void> {
    await this.prisma.framework.delete({
      where: { id },
    });
  }

  /**
   * Prismaの型からドメインモデルに変換
   */
  private toDomain(record: {
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    versions: Array<{
      id: string;
      frameworkId: string;
      version: string;
      status: string;
      effectiveDate: Date | null;
      createdAt: Date;
      updatedAt: Date;
    }>;
  }): Framework {
    const versions = record.versions.map((v) =>
      FrameworkVersion.reconstruct({
        id: v.id as FrameworkVersionId,
        frameworkId: v.frameworkId as FrameworkId,
        versionNumber: v.version,
        status: toVersionStatus(v.status),
        effectiveDate: v.effectiveDate,
        createdAt: v.createdAt,
        updatedAt: v.updatedAt,
      }),
    );

    return Framework.reconstruct({
      id: record.id as FrameworkId,
      name: record.name,
      description: record.description,
      versions,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
