'use client';

import Link from 'next/link';
import { Unit, UnitLabel } from '@qazaq-tas/shared';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { apiFetch, type Category, type Product } from '@/lib/api-client';

const INPUT =
  'h-10 w-full rounded-md border bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30';

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    categoryId: product?.categoryId ?? '',
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    sku: product?.sku ?? '',
    unit: product?.unit ?? Unit.M2,
    price: product?.price ?? '',
    dimensions: product?.dimensions ?? '',
    colors: product?.colors?.join(', ') ?? '',
    shortDescription: product?.shortDescription ?? '',
    description: product?.description ?? '',
    imageUrls: product?.images?.map((image) => image.url).join('\n') ?? '',
    specs: product?.specs
      ? Object.entries(product.specs)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n')
      : '',
    inStock: product?.inStock ?? true,
    isPublished: product?.isPublished ?? false,
    sortOrder: product?.sortOrder ?? 0,
  });

  useEffect(() => {
    apiFetch<Category[]>('/catalog/categories')
      .then(setCategories)
      .catch(() => setError('Не удалось загрузить категории'));
  }, []);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    // Характеристики вводятся строками «Ключ: значение» — переводим в объект.
    const specs: Record<string, string> = {};
    for (const line of form.specs.split('\n')) {
      const [key, ...rest] = line.split(':');
      if (key?.trim() && rest.length > 0) specs[key.trim()] = rest.join(':').trim();
    }

    const payload = {
      categoryId: form.categoryId,
      name: form.name.trim(),
      slug: form.slug.trim(),
      unit: form.unit,
      price: Number(form.price),
      sortOrder: Number(form.sortOrder),
      inStock: form.inStock,
      isPublished: form.isPublished,
      ...(form.sku.trim() ? { sku: form.sku.trim() } : {}),
      ...(form.dimensions.trim() ? { dimensions: form.dimensions.trim() } : {}),
      ...(form.shortDescription.trim() ? { shortDescription: form.shortDescription.trim() } : {}),
      ...(form.description.trim() ? { description: form.description.trim() } : {}),
      ...(form.colors.trim()
        ? {
            colors: form.colors
              .split(',')
              .map((color) => color.trim())
              .filter(Boolean),
          }
        : {}),
      ...(Object.keys(specs).length > 0 ? { specs } : {}),
      ...(form.imageUrls.trim()
        ? {
            imageUrls: form.imageUrls
              .split('\n')
              .map((url) => url.trim())
              .filter(Boolean),
          }
        : {}),
    };

    try {
      if (product) {
        await apiFetch(`/catalog/products/${product.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch('/catalog/products', { method: 'POST', body: JSON.stringify(payload) });
      }
      router.push('/admin/catalog');
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Не удалось сохранить товар');
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <section className="space-y-4 rounded-xl border bg-[var(--card)] p-6">
        <h2 className="text-sm font-medium">Основное</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-sm">Категория</span>
            <select
              required
              value={form.categoryId}
              onChange={(event) => update('categoryId', event.target.value)}
              className={INPUT}
            >
              <option value="">— выберите —</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-sm">Артикул</span>
            <input
              value={form.sku}
              onChange={(event) => update('sku', event.target.value)}
              className={INPUT}
              placeholder="БР-300-60"
            />
          </label>
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm">Название</span>
          <input
            required
            value={form.name}
            onChange={(event) => update('name', event.target.value)}
            className={INPUT}
            placeholder="Брусчатка «Классика» 300x300x60"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm">Адрес страницы</span>
          <input
            required
            pattern="[a-z0-9\-]+"
            value={form.slug}
            onChange={(event) => update('slug', event.target.value)}
            className={INPUT}
            placeholder="bruschatka-klassika-300"
          />
          <span className="text-xs text-[var(--muted-foreground)]">
            Латиница в нижнем регистре, цифры и дефис
          </span>
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="space-y-1.5">
            <span className="text-sm">Цена, ₸</span>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(event) => update('price', event.target.value)}
              className={INPUT}
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm">Единица</span>
            <select
              value={form.unit}
              onChange={(event) => update('unit', event.target.value)}
              className={INPUT}
            >
              {Object.values(Unit).map((unit) => (
                <option key={unit} value={unit}>
                  {UnitLabel[unit]}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-sm">Порядок</span>
            <input
              type="number"
              min="0"
              value={form.sortOrder}
              onChange={(event) => update('sortOrder', Number(event.target.value))}
              className={INPUT}
            />
          </label>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border bg-[var(--card)] p-6">
        <h2 className="text-sm font-medium">Характеристики</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-sm">Размеры</span>
            <input
              value={form.dimensions}
              onChange={(event) => update('dimensions', event.target.value)}
              className={INPUT}
              placeholder="300x300x60 мм"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm">Цвета через запятую</span>
            <input
              value={form.colors}
              onChange={(event) => update('colors', event.target.value)}
              className={INPUT}
              placeholder="Серый, Красный, Жёлтый"
            />
          </label>
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm">Характеристики</span>
          <textarea
            rows={4}
            value={form.specs}
            onChange={(event) => update('specs', event.target.value)}
            className="w-full rounded-md border bg-[var(--background)] p-3 text-sm outline-none focus:border-[var(--accent)]"
            placeholder={'Морозостойкость: F200\nПрочность: М400\nИстираемость: 0,7 г/см²'}
          />
          <span className="text-xs text-[var(--muted-foreground)]">
            По одной строке: название, двоеточие, значение
          </span>
        </label>
      </section>

      <section className="space-y-4 rounded-xl border bg-[var(--card)] p-6">
        <h2 className="text-sm font-medium">Описание и фотографии</h2>

        <label className="block space-y-1.5">
          <span className="text-sm">Краткое описание</span>
          <input
            value={form.shortDescription}
            onChange={(event) => update('shortDescription', event.target.value)}
            className={INPUT}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm">Полное описание</span>
          <textarea
            rows={5}
            value={form.description}
            onChange={(event) => update('description', event.target.value)}
            className="w-full rounded-md border bg-[var(--background)] p-3 text-sm outline-none focus:border-[var(--accent)]"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm">Ссылки на фотографии</span>
          <textarea
            rows={3}
            value={form.imageUrls}
            onChange={(event) => update('imageUrls', event.target.value)}
            className="w-full rounded-md border bg-[var(--background)] p-3 text-sm outline-none focus:border-[var(--accent)]"
            placeholder={'https://example.com/foto-1.jpg\nhttps://example.com/foto-2.jpg'}
          />
          <span className="text-xs text-[var(--muted-foreground)]">
            По одной ссылке в строке. Загрузка файлов с компьютера появится следующим шагом.
          </span>
        </label>
      </section>

      <section className="flex flex-wrap items-center gap-6 rounded-xl border bg-[var(--card)] p-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.inStock}
            onChange={(event) => update('inStock', event.target.checked)}
            className="size-4"
          />
          В наличии
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(event) => update('isPublished', event.target.checked)}
            className="size-4"
          />
          Опубликован на сайте
        </label>
      </section>

      {error && (
        <p
          role="alert"
          className="rounded-md bg-[var(--destructive)]/10 px-3 py-2 text-sm text-[var(--destructive)]"
        >
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={busy}
          className="h-10 rounded-md bg-[var(--primary)] px-5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-60"
        >
          {busy ? 'Сохраняем...' : product ? 'Сохранить' : 'Создать товар'}
        </button>
        <Link
          href="/admin/catalog"
          className="flex h-10 items-center rounded-md border px-5 text-sm hover:bg-[var(--secondary)]"
        >
          Отмена
        </Link>
      </div>
    </form>
  );
}
