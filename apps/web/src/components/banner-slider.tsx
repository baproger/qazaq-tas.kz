'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Locale, SiteBanner } from '@/lib/site';

interface Props {
  banners: SiteBanner[];
  locale: Locale;
  /** Пауза между слайдами, мс */
  interval?: number;
}

/**
 * Лента акций. Листается сама, но останавливается при наведении и при фокусе
 * с клавиатуры — иначе читающий не успевает дочитать слайд.
 */
export function BannerSlider({ banners, locale, interval = 6000 }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);

  const count = banners.length;
  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

  useEffect(() => {
    if (count < 2 || paused) return;

    // Не крутим ленту, если пользователь просил уменьшить движение.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const timer = setInterval(() => setIndex((current) => (current + 1) % count), interval);
    return () => clearInterval(timer);
  }, [count, paused, interval]);

  if (count === 0) return null;

  const href = (banner: SiteBanner) =>
    banner.linkUrl?.startsWith('/') ? `/${locale}${banner.linkUrl}` : (banner.linkUrl ?? '#');

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Акции и предложения"
      className="relative overflow-hidden bg-stone-900 text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(event) => {
        touchStart.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (touchStart.current === null) return;
        const delta = (event.changedTouches[0]?.clientX ?? 0) - touchStart.current;
        if (Math.abs(delta) > 40) go(index + (delta < 0 ? 1 : -1));
        touchStart.current = null;
      }}
    >
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {banners.map((banner, position) => (
          <div
            key={banner.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${position + 1} из ${count}`}
            aria-hidden={position !== index}
            className="w-full shrink-0"
          >
            <Link
              href={href(banner)}
              tabIndex={position === index ? 0 : -1}
              className={
                banner.imageUrl
                  ? 'group relative flex min-h-[13rem] items-end sm:min-h-[16rem] lg:min-h-[19rem]'
                  : 'group mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-sm sm:px-6'
              }
            >
              {banner.imageUrl && (
                <>
                  {/* Снимок закрывает всю площадь без искажения пропорций */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={banner.imageUrl}
                    alt=""
                    className="absolute inset-0 size-full object-cover"
                    loading={position === 0 ? 'eager' : 'lazy'}
                  />
                  {/* Затемнение снизу: текст остаётся читаемым на светлой фотографии */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/45 to-stone-950/10" />
                </>
              )}

              <div
                className={
                  banner.imageUrl
                    ? 'relative mx-auto w-full max-w-6xl px-4 pt-8 pb-10 sm:px-6'
                    : 'flex w-full flex-wrap items-center gap-x-3 gap-y-1'
                }
              >
                <span
                  className={
                    banner.imageUrl
                      ? 'block max-w-2xl text-2xl font-semibold text-balance sm:text-3xl'
                      : 'font-medium'
                  }
                >
                  {banner.title}
                </span>

                {banner.subtitle && (
                  <span
                    className={
                      banner.imageUrl
                        ? 'mt-2 block max-w-xl text-pretty text-stone-200'
                        : 'text-stone-300'
                    }
                  >
                    {banner.subtitle}
                  </span>
                )}

                {banner.linkText && (
                  <span
                    className={
                      banner.imageUrl
                        ? 'mt-5 inline-flex h-11 items-center gap-1.5 rounded-lg bg-white px-5 font-medium text-stone-900 transition-transform group-hover:scale-[1.02]'
                        : 'ml-auto inline-flex items-center gap-1 whitespace-nowrap text-amber-400'
                    }
                  >
                    {banner.linkText}
                    <span
                      aria-hidden="true"
                      className="transition-transform group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </span>
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>

      {count > 1 && (
        <div className="absolute inset-x-0 bottom-1 flex justify-center gap-1.5">
          {banners.map((banner, position) => (
            <button
              key={banner.id}
              type="button"
              onClick={() => go(position)}
              aria-label={`Слайд ${position + 1}`}
              aria-current={position === index}
              className={
                position === index
                  ? 'h-1 w-6 rounded-full bg-amber-400 transition-all'
                  : 'h-1 w-1.5 rounded-full bg-white/40 transition-all hover:bg-white/70'
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
