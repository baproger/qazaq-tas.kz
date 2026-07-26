import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type Locale = 'ru' | 'kk';

/** Данные публичного сайта: переводы, настройки, баннеры, витрина каталога. */
@Injectable()
export class SiteService {
  constructor(private readonly prisma: PrismaService) {}

  /** Все строки интерфейса на выбранном языке: { "hero.title": "..." } */
  async getDictionary(locale: Locale): Promise<Record<string, string>> {
    const rows = await this.prisma.translation.findMany({
      select: { key: true, ru: true, kk: true },
    });

    return Object.fromEntries(rows.map((row) => [row.key, locale === 'kk' ? row.kk : row.ru]));
  }

  /** Настройки компании: телефон, WhatsApp, адрес. */
  async getSettings(): Promise<Record<string, string>> {
    const rows = await this.prisma.siteSetting.findMany({ select: { key: true, value: true } });
    return Object.fromEntries(rows.map((row) => [row.key, row.value]));
  }

  async getBanners(locale: Locale) {
    const banners = await this.prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return banners.map((banner) => ({
      id: banner.id,
      title: locale === 'kk' ? banner.titleKk : banner.titleRu,
      subtitle: locale === 'kk' ? banner.subtitleKk : banner.subtitleRu,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl,
      linkText: locale === 'kk' ? banner.linkTextKk : banner.linkTextRu,
    }));
  }

  /** Категории с количеством опубликованных товаров. */
  async getCategories(locale: Locale) {
    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { products: { where: { isPublished: true } } } } },
    });

    return categories.map((category) => ({
      id: category.id,
      slug: category.slug,
      name: localized(locale, category.name, category.nameKk),
      description: localized(locale, category.description, category.descriptionKk),
      imageUrl: category.imageUrl,
      productCount: category._count.products,
    }));
  }

  /** Витрина: только опубликованные товары. */
  async getProducts(locale: Locale, categorySlug?: string) {
    const products = await this.prisma.product.findMany({
      where: {
        isPublished: true,
        ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: {
        category: { select: { slug: true, name: true, nameKk: true } },
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      },
    });

    return products.map((product) => this.toCard(locale, product));
  }

  async getProductBySlug(locale: Locale, slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: { select: { slug: true, name: true, nameKk: true } },
        images: { orderBy: { sortOrder: 'asc' } },
        documents: true,
      },
    });

    if (!product || !product.isPublished) {
      throw new NotFoundException('Товар не найден');
    }

    return {
      ...this.toCard(locale, product),
      description: localized(locale, product.description, product.descriptionKk),
      images: product.images.map((image) => image.url),
      documents: product.documents.map((doc) => ({ title: doc.title, url: doc.url })),
      specs: product.specs ?? {},
    };
  }

  private toCard(
    locale: Locale,
    product: {
      id: string;
      name: string;
      nameKk: string | null;
      slug: string;
      shortDescription: string | null;
      shortDescriptionKk: string | null;
      unit: string;
      price: unknown;
      dimensions: string | null;
      colors: unknown;
      inStock: boolean;
      images: Array<{ url: string }>;
      category: { slug: string; name: string; nameKk: string | null };
    },
  ) {
    return {
      id: product.id,
      slug: product.slug,
      name: localized(locale, product.name, product.nameKk),
      shortDescription: localized(locale, product.shortDescription, product.shortDescriptionKk),
      unit: product.unit,
      price: Number(product.price),
      dimensions: product.dimensions,
      colors: (product.colors as string[] | null) ?? [],
      inStock: product.inStock,
      image: product.images[0]?.url ?? null,
      category: {
        slug: product.category.slug,
        name: localized(locale, product.category.name, product.category.nameKk),
      },
    };
  }
}

/** Казахский вариант, если он заполнен; иначе русский — чтобы сайт не зиял пустотами. */
function localized<T extends string | null>(locale: Locale, ru: T, kk: T): T {
  return locale === 'kk' && kk ? kk : ru;
}
