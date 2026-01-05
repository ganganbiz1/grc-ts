import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UsePipes,
} from '@nestjs/common';
import { FrameworkId } from '../../domain/shared';
import { FrameworkCommandService } from '../../application/framework/framework-command.service';
import { FrameworkQueryService } from '../../application/framework/framework-query.service';
import type {
  CreateFrameworkDto,
  FrameworkIdResponseDto,
  FrameworkSummaryDto,
  FrameworkDetailDto,
} from './dto';
import {
  CreateFrameworkSchema,
  toFrameworkSummaryDto,
  toFrameworkDetailDto,
} from './dto';
import { ZodValidationPipe } from '../shared/zod-validation.pipe';

@Controller('frameworks')
export class FrameworkController {
  constructor(
    private readonly commandService: FrameworkCommandService,
    private readonly queryService: FrameworkQueryService,
  ) {}

  /**
   * GET /api/frameworks
   * 規格一覧を取得する
   */
  @Get()
  async listFrameworks(): Promise<FrameworkSummaryDto[]> {
    const frameworks = await this.queryService.findAll();
    return frameworks.map(toFrameworkSummaryDto);
  }

  /**
   * POST /api/frameworks
   * 新しい規格を作成する
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(CreateFrameworkSchema))
  async createFramework(
    @Body() dto: CreateFrameworkDto,
  ): Promise<FrameworkIdResponseDto> {
    const id = await this.commandService.create({
      name: dto.name,
      description: dto.description,
    });

    return { id };
  }

  /**
   * GET /api/frameworks/:id
   * 規格詳細を取得する
   */
  @Get(':id')
  async getFramework(@Param('id') id: string): Promise<FrameworkDetailDto> {
    const framework = await this.queryService.findById(id as FrameworkId);
    return toFrameworkDetailDto(framework);
  }

  /**
   * PUT /api/frameworks/:id
   * 規格を更新する
   */
  @Put(':id')
  @UsePipes(new ZodValidationPipe(CreateFrameworkSchema))
  async updateFramework(
    @Param('id') id: string,
    @Body() dto: CreateFrameworkDto,
  ): Promise<FrameworkDetailDto> {
    await this.commandService.update({
      id: id as FrameworkId,
      name: dto.name,
      description: dto.description,
    });

    const framework = await this.queryService.findById(id as FrameworkId);
    return toFrameworkDetailDto(framework);
  }

  /**
   * DELETE /api/frameworks/:id
   * 規格を削除する
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFramework(@Param('id') id: string): Promise<void> {
    await this.commandService.delete(id as FrameworkId);
  }
}
