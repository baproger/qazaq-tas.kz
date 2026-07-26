import dynamic from 'next/dynamic';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductCard } from '@/components/product-card';
import {
  getBootstrap,
  getProducts,
  isLocale,
  translator,
  whatsappLink,
  type Locale,
} from '@/lib/site';

// 3D-сцена грузится отдельным куском и только в браузере:
// она не нужна для SEO и не должна задерживать первую отрисовку.
const PaverScene = dynamic(() =>
  import('@/components/paver-scene').then((module) => module.PaverScene),
);

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;

  const [{ dictionary, settings, banners, categories }, products] = await Promise.all([
    getBootstrap(locale),
    getProducts(locale),
  ]);

  const t = translator(dictionary);
  const banner = banners[0];
  const whatsapp = settings['company.whatsapp'] ?? '';

  const features = [
    { title: t('features.own.title'), text: t('features.own.text') },
    { title: t('features.quality.title'), text: t('features.quality.text') },
    { title: t('features.delivery.title'), text: t('features.delivery.text') },
  ];

  return (
    <main>
      {/* Баннер-акция со ссылкой */}
      {banner && (
        <Link
          href={
            banner.linkUrl?.startsWith('/')
              ? `/${locale}${banner.linkUrl}`
              : (banner.linkUrl ?? '#')
          }
          className="group block bg-stone-900 text-white transition-colors hover:bg-stone-800"
        >
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-sm sm:px-6">
            <span className="font-medium">{banner.title}</span>
            {banner.subtitle && <span className="text-stone-300">{banner.subtitle}</span>}
            {banner.linkText && (
              <span className="ml-auto inline-flex items-center gap-1 text-amber-400">
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
      )}

      {/* Первый экран: заголовок и трёхмерная выкладка брусчатки */}
      <section className="relative overflow-hidden border-b border-stone-200 bg-gradient-to-b from-stone-100 to-stone-50">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 lg:block">
          <PaverScene />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="max-w-xl">
            <p className="animate-in fade-in slide-in-from-bottom-2 text-xs font-medium tracking-[0.2em] text-amber-700 uppercase duration-700">
              {t('hero.tagline')}
            </p>

            <h1 className="animate-in fade-in slide-in-from-bottom-3 mt-4 text-4xl leading-[1.1] font-semibold tracking-tight text-balance duration-700 sm:text-5xl">
              {t('hero.title')}
            </h1>

            <p className="animate-in fade-in slide-in-from-bottom-4 mt-5 text-lg leading-relaxed text-pretty text-stone-600 duration-1000">
              {t('hero.subtitle')}
            </p>

            <div className="animate-in fade-in mt-8 flex flex-wrap gap-3 delay-200 duration-1000">
              <Link
                href={`/${locale}/catalog`}
                className="inline-flex h-12 items-center rounded-lg bg-stone-900 px-6 font-medium text-white transition-transform hover:scale-[1.02] active:scale-[0.99]"
              >
                {t('hero.cta')}
              </Link>

              {whatsapp && (
                <a
                  href={whatsappLink(whatsapp, 'Здравствуйте! Интересует продукция QAZAQ TAS.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center rounded-lg border border-stone-300 bg-white px-6 font-medium transition-colors hover:border-stone-400"
                >
                  {t('hero.cta.secondary')}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Каталог — главный смысл сайта, поэтому сразу под первым экраном */}
      <section id="catalog" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">{t('catalog.title')}</h2>
            <p className="mt-2 text-stone-600">{t('catalog.subtitle')}</p>
          </div>
          <Link
            href={`/${locale}/catalog`}
            className="text-sm font-medium text-amber-700 hover:text-amber-800"
          >
            {t('catalog.all')} →
          </Link>
        </div>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/${locale}/catalog?category=${category.slug}`}
                className="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-5 py-4 transition-colors hover:border-amber-600/60"
              >
                <span className="font-medium">{category.name}</span>
                <span className="text-sm tabular-nums text-stone-500">{category.productCount}</span>
              </Link>
            </li>
          ))}
        </ul>

        {products.length > 0 ? (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 6).map((product) => (
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
          <p className="mt-10 rounded-xl border border-dashed border-stone-300 py-12 text-center text-stone-500">
            {t('catalog.empty')}
          </p>
        )}
      </section>

      {/* Преимущества */}
      <section id="production" className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-3xl font-semibold tracking-tight">{t('features.title')}</h2>

          <dl className="mt-8 grid gap-8 sm:grid-cols-3">
            {features.map((feature, index) => (
              <div key={feature.title}>
                <span className="text-sm tabular-nums text-amber-700">0{index + 1}</span>
                <dt className="mt-2 font-medium">{feature.title}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-stone-600">{feature.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </main>
  );
}
