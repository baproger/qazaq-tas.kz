import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateBannerDto {
  @ApiProperty({ example: 'Скидка 10% при заказе от 500 м²' })
  @IsString()
  @MaxLength(255)
  titleRu: string;

  @ApiProperty({ example: '500 м²-ден тапсырыс бергенде 10% жеңілдік' })
  @IsString()
  @MaxLength(255)
  titleKk: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  subtitleRu?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  subtitleKk?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(512)
  imageUrl?: string;

  @ApiPropertyOptional({ example: '/catalog' })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  linkUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(191)
  linkTextRu?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(191)
  linkTextKk?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateBannerDto extends PartialType(CreateBannerDto) {}

export class UpdateTranslationDto {
  @ApiProperty()
  @IsString()
  ru: string;

  @ApiProperty()
  @IsString()
  kk: string;
}

export class UpdateSettingDto {
  @ApiProperty()
  @IsString()
  value: string;
}
