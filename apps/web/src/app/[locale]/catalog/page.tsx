import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductCard } from '@/components/product-card';
import { getBootstrap, getProducts, isLocale, translator, type Locale } from '@/lib/site';

export default async function CatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;

  const { category } = await searchParams;
  const [{ dictionary, categories }, products] = await Promise.all([
    getBootstrap(locale),
    getProducts(locale, category),
  ]);

  const t = translator(dictionary);
  const active = categories.find((item) => item.slug === category);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        {active ? active.name : t('catalog.title')}
      </h1>
      <p className="mt-2 text-stone-600">{active?.description ?? t('catalog.subtitle')}</p>

      <nav aria-label={t('catalog.all')} className="mt-8 flex flex-wrap gap-2">
        <Link
          href={`/${locale}/catalog`}
          aria-current={!category ? 'page' : undefined}
          className={
            !category
              ? 'rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white'
              : 'rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700 transition-colors hover:border-stone-400'
          }
        >
          {t('catalog.all')}
        </Link>

        {categories.map((item) => (
          <Link
            key={item.id}
            href={`/${locale}/catalog?category=${item.slug}`}
            aria-current={category === item.slug ? 'page' : undefined}
            className={
              category === item.slug
                ? 'rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white'
                : 'rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700 transition-colors hover:border-stone-400'
            }
          >
            {item.name}
            <span className="ml-1.5 tabular-nums text-stone-400">{item.productCount}</span>
          </Link>
        ))}
      </nav>

      {products.length > 0 ? (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              locale={locale}
              labels={{
                from: t('catalog.from'),
                inStock: t('catalog.inStock'),
                outOfStock: t('catalog.outOfStock'),
              }}
            />
          ))}
        </ul>
      ) : (
        <p className="mt-8 rounded-xl border border-dashed border-stone-300 py-16 text-center text-stone-500">
          {t('catalog.empty')}
        </p>
      )}
    </main>
  );
}
