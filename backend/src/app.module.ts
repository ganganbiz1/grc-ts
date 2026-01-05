import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { FrameworkModule } from './presentation/framework/framework.module';

@Module({
  imports: [PrismaModule, FrameworkModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
