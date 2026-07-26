'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CURRENCY_SYMBOL, UnitLabel, type Unit } from '@qazaq-tas/shared';
import { useCallback, useEffect, useState } from 'react';
import { apiFetch, type Paginated, type Product } from '@/lib/api-client';

export default function CatalogPage() {
  const router = useRouter();
  const [data, setData] = useState<Paginated<Product> | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '20' });
      if (search.trim()) params.set('search', search.trim());
      setData(await apiFetch<Paginated<Product>>(`/catalog/products?${params}`));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Не удалось загрузить товары');
    }
  }, [page, search]);

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [load]);

  /** Копия товара: экономит время, когда позиции отличаются только размером или цветом. */
  async function handleDuplicate(product: Product) {
    setError(null);
    try {
      const copy = await apiFetch<Product>(`/catalog/products/${product.id}/duplicate`, {
        method: 'POST',
      });
      // Сразу открываем копию на правку — обычно её и надо переименовать
      router.push(`/admin/catalog/${copy.id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Не удалось создать копию');
    }
  }

  async function handleDelete(product: Product) {
    if (!confirm(`Удалить товар «${product.name}»? Действие необратимо.`)) return;

    try {
      await apiFetch(`/catalog/products/${product.id}`, { method: 'DELETE' });
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Не удалось удалить товар');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Каталог товаров</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {data ? `Всего товаров: ${data.total}` : 'Загрузка...'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/catalog/categories"
            className="flex h-10 items-center rounded-md border px-4 text-sm hover:bg-[var(--secondary)]"
          >
            Категории
          </Link>
          <Link
            href="/admin/catalog/new"
            className="flex h-10 items-center rounded-md bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
          >
            Добавить товар
          </Link>
        </div>
      </div>

      <input
        value={search}
        onChange={(event) => {
          setPage(1);
          setSearch(event.target.value);
        }}
        placeholder="Поиск по названию, артикулу или адресу"
        className="h-10 w-full max-w-md rounded-md border bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--accent)]"
      />

      {error && (
        <p className="rounded-md bg-[var(--destructive)]/10 px-3 py-2 text-sm text-[var(--destructive)]">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border bg-[var(--card)]">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-[var(--muted-foreground)]">
            <tr>
              <th className="px-4 py-3 font-medium">Название</th>
              <th className="px-4 py-3 font-medium">Категория</th>
              <th className="px-4 py-3 font-medium">Цена</th>
              <th className="px-4 py-3 font-medium">Статус</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {data?.items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-[var(--muted-foreground)]">
                  Товаров пока нет. Нажмите «Добавить товар».
                </td>
              </tr>
            )}

            {data?.items.map((product) => (
              <tr key={product.id} className="border-b last:border-0">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/catalog/${product.id}`}
                    className="font-medium hover:underline"
                  >
                    {product.name}
                  </Link>
                  {product.sku && (
                    <span className="ml-2 text-xs text-[var(--muted-foreground)]">
                      {product.sku}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-[var(--muted-foreground)]">
                  {product.category?.name ?? '—'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {Number(product.price).toLocaleString('ru-RU')} {CURRENCY_SYMBOL} /{' '}
                  {UnitLabel[product.unit as Unit]}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      product.isPublished
                        ? 'rounded-full bg-[var(--accent)]/15 px-2 py-0.5 text-xs'
                        : 'rounded-full bg-[var(--secondary)] px-2 py-0.5 text-xs text-[var(--muted-foreground)]'
                    }
                  >
                    {product.isPublished ? 'Опубликован' : 'Черновик'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <Link href={`/admin/catalog/${product.id}`} className="text-xs hover:underline">
                    Изменить
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDuplicate(product)}
                    className="ml-3 text-xs hover:underline"
                    title="Создать копию со всеми полями и фотографиями"
                  >
                    Дублировать
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(product)}
                    className="ml-3 text-xs text-[var(--destructive)] hover:underline"
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center gap-3 text-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
            className="rounded-md border px-3 py-1.5 disabled:opacity-40"
          >
            Назад
          </button>
          <span className="text-[var(--muted-foreground)]">
            Страница {data.page} из {data.totalPages}
          </span>
          <button
            type="button"
            disabled={page >= data.totalPages}
            onClick={() => setPage((current) => current + 1)}
            className="rounded-md border px-3 py-1.5 disabled:opacity-40"
          >
            Вперёд
          </button>
        </div>
      )}
    </div>
  );
}
