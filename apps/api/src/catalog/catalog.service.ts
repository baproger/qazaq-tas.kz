import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, type Paginated } from '@qazaq-tas/shared';
import { Prisma } from '@qazaq-tas/database';
import { RevalidationService } from '../common/revalidation.service';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import type { CreateProductDto, ProductListQueryDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class CatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly revalidation: RevalidationService,
  ) {}

  // --- Категории ---

  listCategories(onlyActive = false) {
    return this.prisma.category.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { products: true } } },
    });
  }

  async createCategory(dto: CreateCategoryDto) {
    this.revalidation.trigger();
    return this.guardUnique(() => this.prisma.category.create({ data: dto }));
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    this.revalidation.trigger();
    await this.findCategoryOrFail(id);
    return this.guardUnique(() => this.prisma.category.update({ where: { id }, data: dto }));
  }

  async removeCategory(id: string): Promise<void> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!category) throw new NotFoundException('Категория не найдена');

    // Товары не удаляем вместе с категорией — иначе можно потерять каталог по ошибке.
    if (category._count.products > 0) {
      throw new BadRequestException(
        `В категории ${category._count.products} товар(ов). Перенесите их в другую категорию или удалите.`,
      );
    }

    await this.prisma.category.delete({ where: { id } });
    this.revalidation.trigger();
  }

  // --- Товары ---

  async listProducts(query: ProductListQueryDto): Promise<Paginated<unknown>> {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(query.pageSize ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

    const where: Prisma.ProductWhereInput = {
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search } },
              { sku: { contains: query.search } },
              { slug: { contains: query.search } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) || 1 };
  }

  async findProduct(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        documents: true,
      },
    });

    if (!product) throw new NotFoundException('Товар не найден');
    return product;
  }

  async createProduct(dto: CreateProductDto) {
    this.revalidation.trigger();
    const { imageUrls, ...data } = dto;
    await this.findCategoryOrFail(data.categoryId);

    return this.guardUnique(() =>
      this.prisma.product.create({
        data: {
          ...data,
          unit: data.unit as never,
          availability: data.availability as never,
          colors: (data.colors as never) ?? undefined,
          specs: data.specs ?? undefined,
          images: imageUrls?.length
            ? {
                create: imageUrls.map((url, index) => ({
                  url,
                  sortOrder: index,
                  isMain: index === 0,
                })),
              }
            : undefined,
        },
        include: { category: true, images: true },
      }),
    );
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    this.revalidation.trigger();
    await this.findProduct(id);
    const { imageUrls, ...data } = dto;

    if (data.categoryId) await this.findCategoryOrFail(data.categoryId);

    return this.guardUnique(() =>
      this.prisma.product.update({
        where: { id },
        data: {
          ...data,
          unit: data.unit as never,
          availability: data.availability as never,
          colors: (data.colors as never) ?? undefined,
          specs: data.specs ?? undefined,
          // Список фотографий заменяется целиком, если он передан.
          ...(imageUrls
            ? {
                images: {
                  deleteMany: {},
                  create: imageUrls.map((url, index) => ({
                    url,
                    sortOrder: index,
                    isMain: index === 0,
                  })),
                },
              }
            : {}),
        },
        include: { category: true, images: { orderBy: { sortOrder: 'asc' } } },
      }),
    );
  }

  /**
   * Дубликат товара: копирует все поля и фотографии.
   * Название и адрес получают пометку, а артикул очищается — он должен быть
   * уникальным, и подставлять его автоматически было бы ошибкой.
   */
  async duplicateProduct(id: string) {
    this.revalidation.trigger();
    const source = await this.prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: 'asc' } } },
    });

    if (!source) throw new NotFoundException('Товар не найден');

    const { id: _id, createdAt: _c, updatedAt: _u, images, sku: _sku, ...data } = source;

    return this.prisma.product.create({
      data: {
        ...data,
        name: `${source.name} (копия)`,
        nameKk: source.nameKk ? `${source.nameKk} (көшірме)` : null,
        slug: await this.uniqueSlug(source.slug),
        // Копия не публикуется сразу: сначала её правят, потом выводят на сайт
        isPublished: false,
        colors: source.colors ?? undefined,
        specs: source.specs ?? undefined,
        images: {
          create: images.map((image) => ({
            url: image.url,
            alt: image.alt,
            isMain: image.isMain,
            sortOrder: image.sortOrder,
          })),
        },
      },
      include: { category: true, images: true },
    });
  }

  /** Подбирает свободный адрес вида slug-2, slug-3... */
  private async uniqueSlug(base: string): Promise<string> {
    for (let suffix = 2; suffix < 100; suffix += 1) {
      const candidate = `${base}-${suffix}`;
      const taken = await this.prisma.product.findUnique({ where: { slug: candidate } });
      if (!taken) return candidate;
    }
    throw new BadRequestException('Не удалось подобрать адрес для копии');
  }

  async removeProduct(id: string): Promise<void> {
    await this.findProduct(id);
    await this.prisma.product.delete({ where: { id } });
    this.revalidation.trigger();
  }

  private async findCategoryOrFail(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Категория не найдена');
    return category;
  }

  /** Превращает нарушение уникальности Prisma в понятное сообщение. */
  private async guardUnique<T>(action: () => Promise<T>): Promise<T> {
    try {
      return await action();
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const fields = (error.meta?.target as string[] | undefined)?.join(', ') ?? 'поле';
        throw new BadRequestException(`Такое значение уже используется: ${fields}`);
      }
      throw error;
    }
  }
}
