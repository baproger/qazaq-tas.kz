import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SiteService } from './site.service';

type Locale = 'ru' | 'kk';

/** Публичные данные сайта. Авторизация не требуется. */
@ApiTags('Сайт')
@Controller('site')
export class SiteController {
  constructor(private readonly site: SiteService) {}

  @Get('bootstrap')
  @ApiOperation({ summary: 'Всё, что нужно сайту за один запрос' })
  async bootstrap(@Query('locale') localeParam?: string) {
    const locale = normalize(localeParam);

    const [dictionary, settings, banners, categories] = await Promise.all([
      this.site.getDictionary(locale),
      this.site.getSettings(),
      this.site.getBanners(locale),
      this.site.getCategories(locale),
    ]);

    return { locale, dictionary, settings, banners, categories };
  }

  @Get('products')
  @ApiOperation({ summary: 'Опубликованные товары витрины' })
  products(@Query('locale') localeParam?: string, @Query('category') category?: string) {
    return this.site.getProducts(normalize(localeParam), category);
  }

  @Get('products/:slug')
  @ApiOperation({ summary: 'Карточка товара для сайта' })
  product(@Param('slug') slug: string, @Query('locale') localeParam?: string) {
    return this.site.getProductBySlug(normalize(localeParam), slug);
  }
}

function normalize(value?: string): Locale {
  return value === 'kk' ? 'kk' : 'ru';
}
