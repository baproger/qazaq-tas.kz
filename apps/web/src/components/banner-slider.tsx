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
 * Лента акций.
 *
 * Два режима отображения:
 *  — если хотя бы у одного слайда есть фотография, все слайды получают
 *    одинаковую высоту полосы, иначе лента прыгала бы при перелистывании;
 *  — если фотографий нет вовсе, лента остаётся узкой текстовой строкой.
 *
 * Листается сама, но останавливается при наведении и при фокусе с клавиатуры —
 * иначе читающий не успевает дочитать слайд.
 */
export function BannerSlider({ banners, locale, interval = 6000 }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);

  const count = banners.length;
  const withPhotos = banners.some((banner) => Boolean(banner.imageUrl));

  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const timer = setInterval(() => setIndex((current) => (current + 1) % count), interval);
    return () => clearInterval(timer);
  }, [count, paused, interval]);

  if (count === 0) return null;

  const href = (banner: SiteBanner) =>
    banner.linkUrl?.startsWith('/') ? `/${locale}${banner.linkUrl}` : (banner.linkUrl ?? '#');

  // Высота полосы подобрана так, чтобы фотография читалась,
  // но первый экран с заголовком и каталогом не уходил за границу экрана.
  const slideHeight = withPhotos ? 'h-[15rem] sm:h-[19rem] lg:h-[23rem]' : '';

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
            className={`w-full shrink-0 ${slideHeight}`}
          >
            <Link
              href={href(banner)}
              tabIndex={position === index ? 0 : -1}
              className={
                withPhotos
                  ? 'group relative flex size-full items-end'
                  : 'group mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-sm sm:px-6'
              }
            >
              {banner.imageUrl && (
                <>
                  {/* Снимок закрывает полосу целиком, пропорции не искажаются */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={banner.imageUrl}
                    alt=""
                    className="absolute inset-0 size-full object-cover"
                    loading={position === 0 ? 'eager' : 'lazy'}
                  />
                  {/* Два затемнения: снизу под текст, слева — чтобы заголовок
                      читался и на светлом снимке при широком экране */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-stone-950/60 via-transparent to-transparent" />
                </>
              )}

              <div
                className={
                  withPhotos
                    ? 'relative mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6 lg:pb-12'
                    : 'flex w-full flex-wrap items-center gap-x-3 gap-y-1'
                }
              >
                <h2
                  className={
                    withPhotos
                      ? 'max-w-2xl text-2xl leading-tight font-semibold text-balance sm:text-3xl lg:text-4xl'
                      : 'text-sm font-medium'
                  }
                >
                  {banner.title}
                </h2>

                {banner.subtitle && (
                  <p
                    className={
                      withPhotos
                        ? 'mt-2 max-w-xl text-pretty text-stone-200 sm:text-lg'
                        : 'text-sm text-stone-300'
                    }
                  >
                    {banner.subtitle}
                  </p>
                )}

                {banner.linkText && (
                  <span
                    className={
                      withPhotos
                        ? 'mt-5 inline-flex h-11 items-center gap-1.5 rounded-lg bg-white px-5 font-medium text-stone-900 transition-transform group-hover:scale-[1.02]'
                        : 'ml-auto inline-flex items-center gap-1 text-sm whitespace-nowrap text-amber-400'
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
        <div
          className={
            withPhotos
              ? 'absolute inset-x-0 bottom-4 flex justify-center gap-1.5'
              : 'absolute inset-x-0 bottom-1 flex justify-center gap-1.5'
          }
        >
          {banners.map((banner, position) => (
            <button
              key={banner.id}
              type="button"
              onClick={() => go(position)}
              aria-label={`Слайд ${position + 1}`}
              aria-current={position === index}
              className={
                position === index
                  ? 'h-1.5 w-7 rounded-full bg-white transition-all'
                  : 'h-1.5 w-1.5 rounded-full bg-white/50 transition-all hover:bg-white/80'
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
