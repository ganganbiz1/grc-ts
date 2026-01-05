import { Module } from '@nestjs/common';
import { FrameworkController } from './framework.controller';
import { FrameworkCommandService } from '../../application/framework/framework-command.service';
import { FrameworkQueryService } from '../../application/framework/framework-query.service';
import { FrameworkRepository } from '../../domain/framework';
import { PrismaFrameworkRepository } from '../../infrastructure/prisma/framework.repository.impl';

@Module({
  controllers: [FrameworkController],
  providers: [
    FrameworkCommandService,
    FrameworkQueryService,
    {
      provide: FrameworkRepository,
      useClass: PrismaFrameworkRepository,
    },
  ],
})
export class FrameworkModule {}
