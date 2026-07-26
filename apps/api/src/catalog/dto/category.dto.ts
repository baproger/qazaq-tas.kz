import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Брусчатка' })
  @IsString()
  @MaxLength(191)
  name: string;

  @ApiProperty({ example: 'bruschatka' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'Адрес: только латиница в нижнем регистре, цифры и дефис' })
  @MaxLength(191)
  slug: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(512)
  imageUrl?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

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

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
