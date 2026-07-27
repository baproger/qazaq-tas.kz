import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@qazaq-tas/shared';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RevalidationService } from '../common/revalidation.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateBannerDto,
  UpdateBannerDto,
  UpdateSettingDto,
  UpdateTranslationDto,
} from './dto/banner.dto';

/** Управление содержимым сайта: баннеры, переводы, настройки компании. */
@ApiTags('Сайт — управление')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.DIRECTOR, UserRole.ADMIN, UserRole.SALES_MANAGER)
@Controller('admin/site')
export class SiteAdminController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly revalidation: RevalidationService,
  ) {}

  /** Любое изменение содержимого должно немедленно отражаться на сайте. */
  private async withRevalidation<T>(action: Promise<T>): Promise<T> {
    const result = await action;
    this.revalidation.trigger();
    return result;
  }

  // --- Баннеры ---

  @Get('banners')
  @ApiOperation({ summary: 'Все баннеры, включая отключённые' })
  listBanners() {
    return this.prisma.banner.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  @Post('banners')
  @ApiOperation({ summary: 'Создать баннер' })
  createBanner(@Body() dto: CreateBannerDto) {
    return this.withRevalidation(this.prisma.banner.create({ data: dto }));
  }

  @Patch('banners/:id')
  @ApiOperation({ summary: 'Изменить баннер' })
  updateBanner(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateBannerDto) {
    return this.withRevalidation(this.prisma.banner.update({ where: { id }, data: dto }));
  }

  @Delete('banners/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Удалить баннер' })
  async removeBanner(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.withRevalidation(this.prisma.banner.delete({ where: { id } }));
  }

  // --- Переводы ---

  @Get('translations')
  @ApiOperation({ summary: 'Все строки интерфейса' })
  listTranslations() {
    return this.prisma.translation.findMany({ orderBy: [{ group: 'asc' }, { key: 'asc' }] });
  }

  @Patch('translations/:id')
  @ApiOperation({ summary: 'Изменить перевод' })
  updateTranslation(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTranslationDto) {
    return this.withRevalidation(this.prisma.translation.update({ where: { id }, data: dto }));
  }

  // --- Настройки ---

  @Get('settings')
  @ApiOperation({ summary: 'Настройки компании' })
  listSettings() {
    return this.prisma.siteSetting.findMany({ orderBy: [{ group: 'asc' }, { label: 'asc' }] });
  }

  @Patch('settings/:id')
  @ApiOperation({ summary: 'Изменить настройку' })
  updateSetting(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSettingDto) {
    return this.withRevalidation(this.prisma.siteSetting.update({ where: { id }, data: dto }));
  }
}
