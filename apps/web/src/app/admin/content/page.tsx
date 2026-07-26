'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ImageUpload } from '@/components/image-upload';
import { apiFetch } from '@/lib/api-client';

interface Banner {
  id: string;
  titleRu: string;
  titleKk: string;
  subtitleRu: string | null;
  subtitleKk: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  linkTextRu: string | null;
  linkTextKk: string | null;
  isActive: boolean;
  sortOrder: number;
}

interface Translation {
  id: string;
  key: string;
  group: string;
  ru: string;
  kk: string;
}

interface Setting {
  id: string;
  key: string;
  label: string;
  value: string;
  group: string;
}

type Tab = 'banners' | 'translations' | 'settings';

const INPUT =
  'h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20';

const EMPTY_BANNER = {
  imageUrl: null as string | null,
  titleRu: '',
  titleKk: '',
  subtitleRu: '',
  subtitleKk: '',
  linkUrl: '/catalog',
  linkTextRu: '',
  linkTextKk: '',
  sortOrder: 0,
};

export default function ContentPage() {
  const [tab, setTab] = useState<Tab>('banners');
  const [banners, setBanners] = useState<Banner[]>([]);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [draft, setDraft] = useState(EMPTY_BANNER);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [b, t, s] = await Promise.all([
        apiFetch<Banner[]>('/admin/site/banners'),
        apiFetch<Translation[]>('/admin/site/translations'),
        apiFetch<Setting[]>('/admin/site/settings'),
      ]);
      setBanners(b);
      setTranslations(t);
      setSettings(s);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Не удалось загрузить содержимое');
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  function report(message: string) {
    setStatus(message);
    setTimeout(() => setStatus(null), 2500);
  }

  async function createBanner() {
    setError(null);
    try {
      await apiFetch('/admin/site/banners', {
        method: 'POST',
        body: JSON.stringify({
          ...draft,
          subtitleRu: draft.subtitleRu || undefined,
          subtitleKk: draft.subtitleKk || undefined,
          imageUrl: draft.imageUrl || undefined,
          linkTextRu: draft.linkTextRu || undefined,
          linkTextKk: draft.linkTextKk || undefined,
        }),
      });
      setDraft(EMPTY_BANNER);
      await load();
      report('Баннер создан');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Не удалось создать баннер');
    }
  }

  async function saveBanner(banner: Banner) {
    try {
      // Отправляем только те поля, которые сервер разрешает менять:
      // createdAt и updatedAt он отклоняет как посторонние.
      await apiFetch(`/admin/site/banners/${banner.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          titleRu: banner.titleRu,
          titleKk: banner.titleKk,
          subtitleRu: banner.subtitleRu ?? undefined,
          subtitleKk: banner.subtitleKk ?? undefined,
          imageUrl: banner.imageUrl ?? undefined,
          linkUrl: banner.linkUrl ?? undefined,
          linkTextRu: banner.linkTextRu ?? undefined,
          linkTextKk: banner.linkTextKk ?? undefined,
          isActive: banner.isActive,
          sortOrder: banner.sortOrder,
        }),
      });
      report('Сохранено');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Не удалось сохранить');
    }
  }

  async function removeBanner(banner: Banner) {
    if (!confirm(`Удалить баннер «${banner.titleRu}»?`)) return;
    await apiFetch(`/admin/site/banners/${banner.id}`, { method: 'DELETE' });
    await load();
    report('Баннер удалён');
  }

  const groups = [...new Set(translations.map((item) => item.group))];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Содержимое сайта</h1>
          <p className="mt-1 text-sm text-stone-500">
            Баннеры, переводы интерфейса и контакты компании
          </p>
        </div>
        <Link
          href="/ru"
          target="_blank"
          className="flex h-10 items-center rounded-md border px-4 text-sm hover:bg-stone-50"
        >
          Открыть сайт
        </Link>
      </div>

      {status && (
        <p role="status" className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {status}
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex gap-1 border-b border-stone-200">
        {(
          [
            ['banners', `Баннеры (${banners.length})`],
            ['translations', `Переводы (${translations.length})`],
            ['settings', `Контакты (${settings.length})`],
          ] as Array<[Tab, string]>
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            aria-current={tab === value}
            className={
              tab === value
                ? '-mb-px border-b-2 border-stone-900 px-4 py-2.5 text-sm font-medium'
                : '-mb-px border-b-2 border-transparent px-4 py-2.5 text-sm text-stone-500 hover:text-stone-900'
            }
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'banners' && (
        <div className="space-y-4">
          <section className="space-y-3 rounded-xl border bg-white p-5">
            <h2 className="text-sm font-medium">Новый баннер</h2>

            <ImageUpload
              value={draft.imageUrl}
              onChange={(url) => setDraft({ ...draft, imageUrl: url })}
              purpose="banner"
              label="Фотография баннера"
              hint="Любой размер — сервер сам обрежет до широкого формата 21:9, сожмёт и переведёт в WebP"
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="text-sm">Заголовок (рус)</span>
                <input
                  value={draft.titleRu}
                  onChange={(e) => setDraft({ ...draft, titleRu: e.target.value })}
                  className={INPUT}
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm">Заголовок (каз)</span>
                <input
                  value={draft.titleKk}
                  onChange={(e) => setDraft({ ...draft, titleKk: e.target.value })}
                  className={INPUT}
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm">Подпись (рус)</span>
                <input
                  value={draft.subtitleRu}
                  onChange={(e) => setDraft({ ...draft, subtitleRu: e.target.value })}
                  className={INPUT}
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm">Подпись (каз)</span>
                <input
                  value={draft.subtitleKk}
                  onChange={(e) => setDraft({ ...draft, subtitleKk: e.target.value })}
                  className={INPUT}
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm">Ссылка</span>
                <input
                  value={draft.linkUrl}
                  onChange={(e) => setDraft({ ...draft, linkUrl: e.target.value })}
                  className={INPUT}
                  placeholder="/catalog"
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm">Текст ссылки (рус / каз)</span>
                <div className="flex gap-2">
                  <input
                    value={draft.linkTextRu}
                    onChange={(e) => setDraft({ ...draft, linkTextRu: e.target.value })}
                    className={INPUT}
                  />
                  <input
                    value={draft.linkTextKk}
                    onChange={(e) => setDraft({ ...draft, linkTextKk: e.target.value })}
                    className={INPUT}
                  />
                </div>
              </label>
            </div>
            <button
              type="button"
              onClick={createBanner}
              disabled={!draft.titleRu || !draft.titleKk}
              className="h-10 rounded-md bg-stone-900 px-5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              Создать баннер
            </button>
          </section>

          {banners.map((banner) => (
            <section key={banner.id} className="space-y-3 rounded-xl border bg-white p-5">
              <ImageUpload
                value={banner.imageUrl}
                onChange={(url) =>
                  setBanners(banners.map((b) => (b.id === banner.id ? { ...b, imageUrl: url } : b)))
                }
                purpose="banner"
                label="Фотография баннера"
                hint="После замены нажмите «Сохранить»"
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={banner.titleRu}
                  onChange={(e) =>
                    setBanners(
                      banners.map((b) =>
                        b.id === banner.id ? { ...b, titleRu: e.target.value } : b,
                      ),
                    )
                  }
                  className={INPUT}
                />
                <input
                  value={banner.titleKk}
                  onChange={(e) =>
                    setBanners(
                      banners.map((b) =>
                        b.id === banner.id ? { ...b, titleKk: e.target.value } : b,
                      ),
                    )
                  }
                  className={INPUT}
                />
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={banner.isActive}
                    onChange={(e) =>
                      setBanners(
                        banners.map((b) =>
                          b.id === banner.id ? { ...b, isActive: e.target.checked } : b,
                        ),
                      )
                    }
                    className="size-4"
                  />
                  Показывать на сайте
                </label>

                <label className="flex items-center gap-2 text-sm">
                  Порядок
                  <input
                    type="number"
                    min="0"
                    value={banner.sortOrder}
                    onChange={(e) =>
                      setBanners(
                        banners.map((b) =>
                          b.id === banner.id ? { ...b, sortOrder: Number(e.target.value) } : b,
                        ),
                      )
                    }
                    className="h-9 w-20 rounded-md border border-stone-300 px-2 text-sm"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => saveBanner(banner)}
                  className="ml-auto h-9 rounded-md border px-4 text-sm hover:bg-stone-50"
                >
                  Сохранить
                </button>
                <button
                  type="button"
                  onClick={() => removeBanner(banner)}
                  className="h-9 rounded-md px-3 text-sm text-red-600 hover:bg-red-50"
                >
                  Удалить
                </button>
              </div>
            </section>
          ))}
        </div>
      )}

      {tab === 'translations' && (
        <div className="space-y-6">
          {groups.map((group) => (
            <section key={group}>
              <h2 className="mb-2 text-sm font-medium text-stone-500">{group}</h2>
              <div className="divide-y rounded-xl border bg-white">
                {translations
                  .filter((item) => item.group === group)
                  .map((item) => (
                    <div key={item.id} className="grid gap-2 p-4 sm:grid-cols-[180px_1fr_1fr_auto]">
                      <code className="self-center text-xs text-stone-500">{item.key}</code>
                      <input
                        value={item.ru}
                        onChange={(e) =>
                          setTranslations(
                            translations.map((t) =>
                              t.id === item.id ? { ...t, ru: e.target.value } : t,
                            ),
                          )
                        }
                        className={INPUT}
                        aria-label={`${item.key} — русский`}
                      />
                      <input
                        value={item.kk}
                        onChange={(e) =>
                          setTranslations(
                            translations.map((t) =>
                              t.id === item.id ? { ...t, kk: e.target.value } : t,
                            ),
                          )
                        }
                        className={INPUT}
                        aria-label={`${item.key} — казахский`}
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          await apiFetch(`/admin/site/translations/${item.id}`, {
                            method: 'PATCH',
                            body: JSON.stringify({ ru: item.ru, kk: item.kk }),
                          });
                          report('Перевод сохранён');
                        }}
                        className="h-10 rounded-md border px-4 text-sm hover:bg-stone-50"
                      >
                        ОК
                      </button>
                    </div>
                  ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {tab === 'settings' && (
        <div className="divide-y rounded-xl border bg-white">
          {settings.map((item) => (
            <div key={item.id} className="grid gap-2 p-4 sm:grid-cols-[220px_1fr_auto]">
              <span className="self-center text-sm">{item.label}</span>
              <input
                value={item.value}
                onChange={(e) =>
                  setSettings(
                    settings.map((s) => (s.id === item.id ? { ...s, value: e.target.value } : s)),
                  )
                }
                className={INPUT}
                aria-label={item.label}
              />
              <button
                type="button"
                onClick={async () => {
                  await apiFetch(`/admin/site/settings/${item.id}`, {
                    method: 'PATCH',
                    body: JSON.stringify({ value: item.value }),
                  });
                  report('Сохранено');
                }}
                className="h-10 rounded-md border px-4 text-sm hover:bg-stone-50"
              >
                ОК
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
