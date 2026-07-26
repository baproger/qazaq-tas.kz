import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Unit } from '@qazaq-tas/shared';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

const UNITS = Object.values(Unit);

export class CreateProductDto {
  @ApiProperty()
  @IsUUID()
  categoryId: string;

  @ApiProperty({ example: 'Брусчатка «Классика» 300x300x60' })
  @IsString()
  @MaxLength(191)
  name: string;

  @ApiProperty({ example: 'bruschatka-klassika-300' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'Адрес: только латиница в нижнем регистре, цифры и дефис' })
  @MaxLength(191)
  slug: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  sku?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  shortDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: UNITS, default: Unit.M2 })
  @IsIn(UNITS, { message: 'Недопустимая единица измерения' })
  unit: string;

  @ApiProperty({ example: 12500 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Цена — число с точностью до копеек' })
  @Min(0)
  price: number;

  @ApiPropertyOptional({ description: 'Верхняя граница цены: выводится как «от X до Y»' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  priceMax?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  oldPrice?: number;

  @ApiPropertyOptional({ example: 'Композитный мрамор' })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  material?: string;

  @ApiPropertyOptional({ example: 'Композитті мәрмәр' })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  materialKk?: string;

  @ApiPropertyOptional({ enum: ['IN_STOCK', 'ON_ORDER', 'ON_REQUEST'] })
  @IsOptional()
  @IsIn(['IN_STOCK', 'ON_ORDER', 'ON_REQUEST'], { message: 'Недопустимый статус наличия' })
  availability?: string;

  @ApiPropertyOptional({ description: 'Высота, см' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  heightCm?: number;

  @ApiPropertyOptional({ description: 'Ширина, см' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  widthCm?: number;

  @ApiPropertyOptional({ description: 'Длина, см' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  lengthCm?: number;

  @ApiPropertyOptional({ description: 'Диаметр, см' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  diameterCm?: number;

  @ApiPropertyOptional({ description: 'Объём, л' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  volumeL?: number;

  @ApiPropertyOptional({ example: '300x300x60 мм' })
  @IsOptional()
  @IsString()
  @MaxLength(191)
  dimensions?: string;

  @ApiPropertyOptional({ example: [{ name: 'Серый', hex: '#8a8a8a' }] })
  @IsOptional()
  @IsArray()
  colors?: Array<{ name: string; hex?: string }>;

  @ApiPropertyOptional({ example: { Морозостойкость: 'F200' } })
  @IsOptional()
  @IsObject()
  specs?: Record<string, string>;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  inStock?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Ссылки на фотографии товара' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  seoTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  seoDescription?: string;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class ProductListQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
