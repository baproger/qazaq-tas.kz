'use client';

import { useRef, useState } from 'react';
import { API_URL, getAccessToken } from '@/lib/auth';

interface Props {
  value: string[];
  onChange: (urls: string[]) => void;
  purpose?: 'product' | 'category' | 'banner';
}

/**
 * Галерея товара: несколько фотографий с загрузкой прямо с компьютера.
 * Первая в списке — главная, она попадает в каталог; порядок меняется стрелками.
 */
export function GalleryUpload({ value, onChange, purpose = 'product' }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function uploadAll(files: File[]) {
    setError(null);
    setBusy(files.length);
    const uploaded: string[] = [];

    for (const file of files) {
      try {
        const body = new FormData();
        body.append('file', file);

        const response = await fetch(`${API_URL}/uploads/image?purpose=${purpose}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${getAccessToken() ?? ''}` },
          body,
        }).catch(() => {
          throw new Error('Сервер не отвечает. Проверьте, запущен ли API, и попробуйте ещё раз.');
        });

        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error(data?.message ?? `Не удалось загрузить ${file.name}`);

        uploaded.push(data.url as string);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Не удалось загрузить файл');
      } finally {
        setBusy((count) => count - 1);
      }
    }

    if (uploaded.length > 0) onChange([...value, ...uploaded]);
  }

  function move(index: number, direction: -1 | 1) {
    const next = [...value];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target]!, next[index]!];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm">Фотографии товара</span>
        {value.length > 0 && (
          <span className="text-xs text-stone-500">
            {value.length} шт · первая показывается в каталоге
          </span>
        )}
      </div>

      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {value.map((url, index) => (
          <li key={url} className="group relative overflow-hidden rounded-lg border bg-stone-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="aspect-square w-full object-cover" />

            {index === 0 && (
              <span className="absolute top-1.5 left-1.5 rounded bg-stone-900/85 px-1.5 py-0.5 text-[10px] font-medium text-white">
                Главная
              </span>
            )}

            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-stone-900/75 p-1 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex gap-0.5">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Левее"
                  className="rounded px-1.5 text-sm text-white disabled:opacity-30"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === value.length - 1}
                  aria-label="Правее"
                  className="rounded px-1.5 text-sm text-white disabled:opacity-30"
                >
                  →
                </button>
              </div>
              <button
                type="button"
                onClick={() => onChange(value.filter((item) => item !== url))}
                aria-label="Удалить фотографию"
                className="rounded px-1.5 text-sm text-red-300 hover:text-red-200"
              >
                ✕
              </button>
            </div>
          </li>
        ))}

        <li>
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={busy > 0}
            className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-stone-300 text-xs text-stone-500 transition-colors hover:border-amber-600 hover:text-amber-700 disabled:opacity-60"
          >
            {busy > 0 ? (
              `Загрузка (${busy})`
            ) : (
              <>
                <span className="text-xl leading-none">+</span>
                Добавить
              </>
            )}
          </button>
        </li>
      </ul>

      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        className="hidden"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          if (files.length > 0) void uploadAll(files);
          event.target.value = '';
        }}
      />

      <p className="text-xs text-stone-500">
        Можно выбрать сразу несколько файлов. Размер и вес не важны — сервер обрежет до 4:3, сожмёт
        и переведёт в WebP.
      </p>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
