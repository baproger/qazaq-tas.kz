'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { LOCALE_NAMES, LOCALES, type Locale } from '@/lib/site';

interface Props {
  locale: Locale;
  phone: string;
  labels: { catalog: string; about: string; production: string; contacts: string };
}

export function SiteHeader({ locale, phone, labels }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const links = [
    { href: `/${locale}/catalog`, label: labels.catalog },
    { href: `/${locale}#production`, label: labels.production },
    { href: `/${locale}#about`, label: labels.about },
    { href: `/${locale}#contacts`, label: labels.contacts },
  ];

  /** Тот же путь на другом языке. */
  function swap(target: Locale): string {
    const rest = pathname.replace(/^\/(ru|kk)/, '');
    return `/${target}${rest}`;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href={`/${locale}`} className="shrink-0 leading-tight" aria-label="QAZAQ TAS GROUP">
          {logoFailed ? (
            // Пока файл логотипа не загружен — показываем текстовое написание.
            <>
              <span className="block text-base font-semibold tracking-tight text-stone-900">
                QAZAQ TAS
              </span>
              <span className="block text-[11px] tracking-[0.18em] text-stone-500 uppercase">
                Group
              </span>
            </>
          ) : (
            // Логотип из apps/web/public. Размеры заданы явно,
            // иначе при загрузке шапка дёргается.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/qazaqtaslogotype.png"
              alt="QAZAQ TAS GROUP"
              width={306}
              height={110}
              className="h-10 w-auto"
              onError={() => setLogoFailed(true)}
            />
          )}
        </Link>

        <nav className="hidden flex-1 items-center gap-7 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-stone-600 transition-colors hover:text-stone-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden items-center rounded-lg border border-stone-200 p-0.5 sm:flex">
            {LOCALES.map((item) => (
              <Link
                key={item}
                href={swap(item)}
                aria-current={item === locale ? 'true' : undefined}
                className={
                  item === locale
                    ? 'rounded-md bg-stone-900 px-2.5 py-1 text-xs font-medium text-white'
                    : 'rounded-md px-2.5 py-1 text-xs text-stone-600 hover:text-stone-900'
                }
              >
                {LOCALE_NAMES[item]}
              </Link>
            ))}
          </div>

          <a
            href={`tel:${phone.replace(/[^\d+]/g, '')}`}
            className="hidden text-sm font-medium whitespace-nowrap text-stone-900 lg:block"
          >
            {phone}
          </a>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label="Меню"
            className="rounded-lg border border-stone-200 p-2 md:hidden"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor">
              <path strokeWidth="1.75" strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-stone-200 bg-white px-4 py-3 md:hidden">
          <ul className="space-y-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm text-stone-700 hover:bg-stone-50"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="flex gap-2 px-3 pt-2">
              {LOCALES.map((item) => (
                <Link
                  key={item}
                  href={swap(item)}
                  className={
                    item === locale
                      ? 'rounded-md bg-stone-900 px-3 py-1.5 text-xs font-medium text-white'
                      : 'rounded-md border border-stone-200 px-3 py-1.5 text-xs text-stone-600'
                  }
                >
                  {LOCALE_NAMES[item]}
                </Link>
              ))}
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
