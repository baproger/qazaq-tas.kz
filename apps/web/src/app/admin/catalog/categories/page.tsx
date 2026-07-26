'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { apiFetch, type Category } from '@/lib/api-client';

const INPUT =
  'h-10 w-full rounded-md border bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ name: '', slug: '', description: '', sortOrder: 0 });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setCategories(await apiFetch<Category[]>('/catalog/categories'));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Не удалось загрузить категории');
    }
  }, []);

  useEffect(() => {
    // Запуск через микрозадачу: иначе setState срабатывает синхронно
    // внутри эффекта и вызывает лишний каскад перерисовок.
    queueMicrotask(() => void load());
  }, [load]);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    try {
      await apiFetch('/catalog/categories', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim(),
          sortOrder: Number(form.sortOrder),
          ...(form.description.trim() ? { description: form.description.trim() } : {}),
        }),
      });
      setForm({ name: '', slug: '', description: '', sortOrder: 0 });
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Не удалось создать категорию');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(category: Category) {
    if (!confirm(`Удалить категорию «${category.name}»?`)) return;

    try {
      await apiFetch(`/catalog/categories/${category.id}`, { method: 'DELETE' });
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Не удалось удалить категорию');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Категории</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Разделы каталога: брусчатка, бордюр, дренаж, МАФ и другие
          </p>
        </div>
        <Link
          href="/admin/catalog"
          className="flex h-10 items-center rounded-md border px-4 text-sm hover:bg-[var(--secondary)]"
        >
          К товарам
        </Link>
      </div>

      {error && (
        <p className="rounded-md bg-[var(--destructive)]/10 px-3 py-2 text-sm text-[var(--destructive)]">
          {error}
        </p>
      )}

      <form onSubmit={handleCreate} className="space-y-4 rounded-xl border bg-[var(--card)] p-6">
        <h2 className="text-sm font-medium">Новая категория</h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="space-y-1.5">
            <span className="text-sm">Название</span>
            <input
              required
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className={INPUT}
              placeholder="Бордюр"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm">Адрес</span>
            <input
              required
              pattern="[a-z0-9\-]+"
              value={form.slug}
              onChange={(event) => setForm({ ...form, slug: event.target.value })}
              className={INPUT}
              placeholder="bordyur"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm">Порядок</span>
            <input
              type="number"
              min="0"
              value={form.sortOrder}
              onChange={(event) => setForm({ ...form, sortOrder: Number(event.target.value) })}
              className={INPUT}
            />
          </label>
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm">Описание</span>
          <input
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            className={INPUT}
          />
        </label>

        <button
          type="submit"
          disabled={busy}
          className="h-10 rounded-md bg-[var(--primary)] px-5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-60"
        >
          {busy ? 'Создаём...' : 'Создать категорию'}
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border bg-[var(--card)]">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-[var(--muted-foreground)]">
            <tr>
              <th className="px-4 py-3 font-medium">Название</th>
              <th className="px-4 py-3 font-medium">Адрес</th>
              <th className="px-4 py-3 font-medium">Товаров</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-[var(--muted-foreground)]">
                  Категорий пока нет
                </td>
              </tr>
            )}

            {categories.map((category) => (
              <tr key={category.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{category.name}</td>
                <td className="px-4 py-3 text-[var(--muted-foreground)]">/{category.slug}</td>
                <td className="px-4 py-3">{category._count?.products ?? 0}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleDelete(category)}
                    className="text-xs text-[var(--destructive)] hover:underline"
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
