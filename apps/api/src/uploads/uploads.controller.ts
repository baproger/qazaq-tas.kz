import { BadRequestException, Controller, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@qazaq-tas/shared';
import type { FastifyRequest } from 'fastify';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UploadsService, type ImagePurpose } from './uploads.service';

const PURPOSES: ImagePurpose[] = ['banner', 'product', 'category'];

@ApiTags('Загрузка файлов')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.DIRECTOR, UserRole.ADMIN, UserRole.SALES_MANAGER)
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Post('image')
  @ApiOperation({ summary: 'Загрузить изображение; сервер сам обрежет и сожмёт его' })
  async uploadImage(@Req() request: FastifyRequest, @Query('purpose') purpose?: string) {
    const file = await request.file();
    if (!file) throw new BadRequestException('Файл не передан');

    const target = (PURPOSES as string[]).includes(purpose ?? '')
      ? (purpose as ImagePurpose)
      : 'product';

    return this.uploads.saveImage(await file.toBuffer(), file.mimetype, target);
  }
}
