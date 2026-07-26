import { UnitLabel, type Unit } from '@qazaq-tas/shared';
import Link from 'next/link';
import { formatPrice, type Locale, type SiteProduct } from '@/lib/site';

interface Props {
  product: SiteProduct;
  locale: Locale;
  labels: { from: string; inStock: string; outOfStock: string };
}

export function ProductCard({ product, locale, labels }: Props) {
  const unitLabel = UnitLabel[product.unit as Unit] ?? product.unit;

  return (
    <li className="group">
      <Link
        href={`/${locale}/catalog/${product.slug}`}
        className="flex h-full flex-col overflow-hidden rounded-xl border border-stone-200 bg-white transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-stone-300 focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:outline-none"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
          {product.image ? (
            // Фотографии приходят с произвольных доменов, поэтому обычный img.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <svg viewBox="0 0 48 48" className="size-12 text-stone-300" aria-hidden="true">
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

          <span
            className={
              product.inStock
                ? 'absolute top-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-emerald-700'
                : 'absolute top-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-stone-600'
            }
          >
            {product.inStock ? labels.inStock : labels.outOfStock}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <p className="text-xs tracking-wide text-stone-500 uppercase">{product.category.name}</p>
          <h3 className="mt-1 font-medium text-balance text-stone-900">{product.name}</h3>

          {product.dimensions && (
            <p className="mt-1 text-sm text-stone-500">{product.dimensions}</p>
          )}

          <p className="mt-auto pt-3 text-lg font-semibold tabular-nums text-stone-900">
            <span className="text-sm font-normal text-stone-500">{labels.from} </span>
            {formatPrice(product.price)} ₸
            <span className="text-sm font-normal text-stone-500"> / {unitLabel}</span>
          </p>
        </div>
      </Link>
    </li>
  );
}
