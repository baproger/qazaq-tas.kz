import { UnitLabel, type Unit } from '@qazaq-tas/shared';
import Link from 'next/link';
import { formatPrice, type Locale, type SiteProduct } from '@/lib/site';

interface Props {
  product: SiteProduct;
  locale: Locale;
  labels: {
    from: string;
    to: string;
    onRequest: string;
    inStock: string;
    onOrder: string;
  };
}

export function ProductCard({ product, locale, labels }: Props) {
  const unitLabel = UnitLabel[product.unit as Unit] ?? product.unit;
  const onRequest = product.availability === 'ON_REQUEST';
  const onOrder = product.availability === 'ON_ORDER';

  return (
    <li className="group">
      <Link
        href={`/${locale}/catalog/${product.slug}`}
        className="flex h-full flex-col overflow-hidden rounded-xl border border-stone-200 bg-white transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-1 hover:border-stone-300 hover:shadow-[0_8px_24px_-12px_rgb(28_25_23/0.25)] focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:outline-none"
      >
        <div className="relative aspect-square overflow-hidden bg-stone-50">
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

          {onOrder && (
            <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-amber-800 shadow-sm">
              <span className="size-1.5 rounded-full bg-amber-500" aria-hidden="true" />
              {labels.onOrder}
            </span>
          )}
          {product.availability === 'IN_STOCK' && (
            <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-emerald-700 shadow-sm">
              <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              {labels.inStock}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <h3 className="leading-snug font-medium text-balance text-stone-900">{product.name}</h3>

          {/* Габариты — компактными метками, как в отраслевых каталогах */}
          {(product.measures.length > 0 || product.dimensions) && (
            <ul className="flex flex-wrap gap-1.5">
              {product.dimensions && (
                <li className="rounded-md bg-stone-100 px-2 py-1 text-xs text-stone-700">
                  {product.dimensions}
                </li>
              )}
              {product.measures.map((measure) => (
                <li
                  key={measure.label}
                  className="rounded-md bg-stone-100 px-2 py-1 text-xs text-stone-700"
                >
                  <span className="text-stone-500">{measure.label}</span> {measure.value}
                </li>
              ))}
            </ul>
          )}

          {/* Материал и образцы цветов */}
          {(product.material || product.colors.length > 0) && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-stone-600">
              {product.material && <span>{product.material}</span>}
              {product.colors.length > 0 && (
                <ul className="flex items-center gap-1" aria-label="Доступные цвета">
                  {product.colors.slice(0, 8).map((color) => (
                    <li key={color.name} title={color.name}>
                      <span
                        className="block size-4 rounded-full border border-stone-300"
                        style={color.hex ? { backgroundColor: color.hex } : undefined}
                      />
                      <span className="sr-only">{color.name}</span>
                    </li>
                  ))}
                  {product.colors.length > 8 && (
                    <li className="text-stone-500">+{product.colors.length - 8}</li>
                  )}
                </ul>
              )}
            </div>
          )}

          <p className="mt-auto border-t border-dashed border-stone-200 pt-3">
            {onRequest ? (
              <span className="text-lg font-semibold text-stone-900">{labels.onRequest}</span>
            ) : (
              <>
                <span className="text-sm text-stone-500">{labels.from} </span>
                <span className="text-lg font-semibold tabular-nums text-stone-900">
                  {formatPrice(product.price)}
                </span>
                {product.priceMax && product.priceMax > product.price && (
                  <>
                    <span className="text-sm text-stone-500"> {labels.to} </span>
                    <span className="text-lg font-semibold tabular-nums text-stone-900">
                      {formatPrice(product.priceMax)}
                    </span>
                  </>
                )}
                <span className="text-sm text-stone-500"> ₸/{unitLabel}</span>
              </>
            )}
          </p>
        </div>
      </Link>
    </li>
  );
}
