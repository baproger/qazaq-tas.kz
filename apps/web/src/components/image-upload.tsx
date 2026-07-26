'use client';

import { useRef, useState } from 'react';
import { API_URL, getAccessToken } from '@/lib/auth';

interface Props {
  value: string | null;
  onChange: (url: string | null) => void;
  /** Под какое место готовится изображение — от этого зависят пропорции */
  purpose: 'banner' | 'product' | 'category';
  label?: string;
  hint?: string;
}

/**
 * Загрузка изображения с компьютера.
 * Обрезкой и сжатием занимается сервер, поэтому подойдёт любой снимок:
 * с телефона, из мессенджера, со сканера.
 */
export function ImageUpload({ value, onChange, purpose, label = 'Изображение', hint }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);
    setBusy(true);

    try {
      const body = new FormData();
      body.append('file', file);

      const response = await fetch(`${API_URL}/uploads/image?purpose=${purpose}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getAccessToken() ?? ''}` },
        body,
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message ?? 'Не удалось загрузить файл');
      }

      onChange(data.url as string);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Не удалось загрузить файл');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <span className="text-sm">{label}</span>

      {value ? (
        <div className="relative overflow-hidden rounded-lg border border-stone-200 bg-stone-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value.startsWith('/uploads') ? value : value}
            alt=""
            className="max-h-40 w-full object-cover"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 rounded-md bg-white/90 px-2.5 py-1 text-xs text-red-600 hover:bg-white"
          >
            Убрать
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={busy}
          className="flex h-28 w-full flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-stone-300 text-sm text-stone-500 transition-colors hover:border-amber-600 hover:text-amber-700 disabled:opacity-60"
        >
          {busy ? (
            'Загружаем и обрабатываем...'
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor">
                <path strokeWidth="1.6" strokeLinecap="round" d="M12 16V4m0 0L8 8m4-4 4 4" />
                <path
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"
                />
              </svg>
              Выбрать файл с компьютера
            </>
          )}
        </button>
      )}

      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
          event.target.value = '';
        }}
      />

      {hint && !error && <p className="text-xs text-stone-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
