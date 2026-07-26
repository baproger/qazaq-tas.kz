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
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@qazaq-tas/shared';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CatalogService } from './catalog.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { CreateProductDto, ProductListQueryDto, UpdateProductDto } from './dto/product.dto';

/** Роли, которым разрешено менять каталог. */
const CATALOG_EDITORS = [UserRole.DIRECTOR, UserRole.ADMIN, UserRole.SALES_MANAGER] as const;

@ApiTags('Каталог')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  // --- Категории ---

  @Get('categories')
  @ApiOperation({ summary: 'Список категорий' })
  listCategories() {
    return this.catalog.listCategories();
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CATALOG_EDITORS)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать категорию' })
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.catalog.createCategory(dto);
  }

  @Patch('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CATALOG_EDITORS)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Изменить категорию' })
  updateCategory(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCategoryDto) {
    return this.catalog.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DIRECTOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить категорию' })
  removeCategory(@Param('id', ParseUUIDPipe) id: string) {
    return this.catalog.removeCategory(id);
  }

  // --- Товары ---

  @Get('products')
  @ApiOperation({ summary: 'Список товаров с поиском и постраничным выводом' })
  listProducts(@Query() query: ProductListQueryDto) {
    return this.catalog.listProducts(query);
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Карточка товара' })
  findProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.catalog.findProduct(id);
  }

  @Post('products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CATALOG_EDITORS)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать товар' })
  createProduct(@Body() dto: CreateProductDto) {
    return this.catalog.createProduct(dto);
  }

  @Patch('products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CATALOG_EDITORS)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Изменить товар' })
  updateProduct(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductDto) {
    return this.catalog.updateProduct(id, dto);
  }

  @Post('products/:id/duplicate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...CATALOG_EDITORS)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать копию товара' })
  duplicateProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.catalog.duplicateProduct(id);
  }

  @Delete('products/:id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DIRECTOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить товар' })
  removeProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.catalog.removeProduct(id);
  }
}
