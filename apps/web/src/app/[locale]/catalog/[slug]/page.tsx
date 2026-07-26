import { UnitLabel, type Unit } from '@qazaq-tas/shared';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PriceCalculator } from '@/components/price-calculator';
import { getBootstrap, getProduct, isLocale, translator, type Locale } from '@/lib/site';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};

  const product = await getProduct(locale, slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.shortDescription ?? undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;

  const [{ dictionary, settings }, product] = await Promise.all([
    getBootstrap(locale),
    getProduct(locale, slug),
  ]);

  if (!product) notFound();

  const t = translator(dictionary);
  const unitLabel = UnitLabel[product.unit as Unit] ?? product.unit;
  const specs = Object.entries(product.specs);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <nav aria-label="breadcrumb" className="text-sm text-stone-500">
        <Link href={`/${locale}/catalog`} className="hover:text-stone-900">
          {t('catalog.title')}
        </Link>
        <span className="mx-2" aria-hidden="true">
          /
        </span>
        <Link
          href={`/${locale}/catalog?category=${product.category.slug}`}
          className="hover:text-stone-900"
        >
          {product.category.name}
        </Link>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
            {product.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.images[0]}
                alt={product.name}
                className="aspect-[4/3] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center text-stone-400">
                <svg viewBox="0 0 48 48" className="size-16" aria-hidden="true">
                  <rect x="6" y="14" width="16" height="9" rx="1.5" fill="currentColor" />
                  <rect
                    x="25"
                    y="14"
                    width="16"
                    height="9"
                    rx="1.5"
                    fill="currentColor"
                    opacity=".6"
                  />
                  <rect
                    x="6"
                    y="26"
                    width="16"
                    height="9"
                    rx="1.5"
                    fill="currentColor"
                    opacity=".6"
                  />
                  <rect x="25" y="26" width="16" height="9" rx="1.5" fill="currentColor" />
                </svg>
              </div>
            )}
          </div>

          {product.images.length > 1 && (
            <ul className="mt-3 grid grid-cols-4 gap-3">
              {product.images.slice(1, 5).map((url) => (
                <li key={url} className="overflow-hidden rounded-lg border border-stone-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    loading="lazy"
                    className="aspect-square w-full object-cover"
                  />
                </li>
              ))}
            </ul>
          )}

          <h1 className="mt-8 text-3xl font-semibold tracking-tight text-balance">
            {product.name}
          </h1>

          {product.shortDescription && (
            <p className="mt-3 text-lg leading-relaxed text-pretty text-stone-600">
              {product.shortDescription}
            </p>
          )}

          {product.description && (
            <div className="mt-6 leading-relaxed whitespace-pre-line text-stone-700">
              {product.description}
            </div>
          )}

          {(specs.length > 0 || product.dimensions || product.colors.length > 0) && (
            <section className="mt-10">
              <h2 className="text-xl font-semibold">{t('product.specs')}</h2>
              <dl className="mt-4 divide-y divide-stone-200 border-y border-stone-200">
                {product.dimensions && (
                  <div className="flex justify-between gap-6 py-3">
                    <dt className="text-stone-600">{t('product.dimensions')}</dt>
                    <dd className="text-right font-medium">{product.dimensions}</dd>
                  </div>
                )}
                {product.colors.length > 0 && (
                  <div className="flex justify-between gap-6 py-3">
                    <dt className="text-stone-600">{t('product.colors')}</dt>
                    <dd className="text-right font-medium">{product.colors.join(', ')}</dd>
                  </div>
                )}
                {specs.map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-6 py-3">
                    <dt className="text-stone-600">{key}</dt>
                    <dd className="text-right font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <PriceCalculator
            productName={product.name}
            price={product.price}
            unit={product.unit}
            whatsappPhone={settings['company.whatsapp'] ?? ''}
            labels={{
              title: t('calc.title'),
              area: t('calc.area'),
              total: t('calc.total'),
              note: t('calc.note'),
              whatsapp: t('calc.whatsapp'),
            }}
          />

          <p className="mt-3 text-center text-sm text-stone-500">
            {product.inStock ? t('catalog.inStock') : t('catalog.outOfStock')} · {unitLabel}
          </p>
        </div>
      </div>
    </main>
  );
}
