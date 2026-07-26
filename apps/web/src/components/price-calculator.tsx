'use client';

import { UnitLabel, type Unit } from '@qazaq-tas/shared';
import { useMemo, useState } from 'react';
import { formatPrice, whatsappLink } from '@/lib/site';

interface Props {
  productName: string;
  price: number;
  unit: string;
  whatsappPhone: string;
  labels: {
    title: string;
    area: string;
    total: string;
    note: string;
    whatsapp: string;
  };
}

/**
 * Расчёт ориентировочной стоимости по площади.
 * Точную сумму клиент уточняет у менеджера — она зависит от объёма,
 * цвета и доставки, поэтому здесь сознательно только ориентир.
 */
export function PriceCalculator({ productName, price, unit, whatsappPhone, labels }: Props) {
  const [amount, setAmount] = useState('100');

  const quantity = Number(amount.replace(',', '.'));
  const isValid = Number.isFinite(quantity) && quantity > 0;
  const total = useMemo(() => (isValid ? price * quantity : 0), [isValid, price, quantity]);

  const unitLabel = UnitLabel[unit as Unit] ?? unit;

  const message = isValid
    ? `Здравствуйте! Интересует «${productName}», ${quantity} ${unitLabel}. ` +
      `Ориентировочно ${formatPrice(total)} ₸. Подскажите точную стоимость с доставкой.`
    : `Здравствуйте! Интересует «${productName}». Подскажите стоимость.`;

  return (
    <section
      aria-labelledby="calc-heading"
      className="rounded-2xl border border-stone-200 bg-white p-6"
    >
      <h2 id="calc-heading" className="text-base font-semibold text-stone-900">
        {labels.title}
      </h2>

      <div className="mt-4 flex items-end gap-3">
        <label className="flex-1">
          <span className="text-sm text-stone-600">
            {labels.area}, {unitLabel}
          </span>
          <input
            type="number"
            inputMode="decimal"
            min="1"
            step="1"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="mt-1.5 h-12 w-full rounded-lg border border-stone-300 px-3 text-lg tabular-nums outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20"
          />
        </label>

        <div className="flex gap-1.5 pb-1">
          {[50, 100, 500].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmount(String(preset))}
              className="h-9 rounded-lg border border-stone-300 px-3 text-sm text-stone-700 transition-colors hover:border-amber-600 hover:text-amber-700"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 border-t border-stone-200 pt-4">
        <p className="text-sm text-stone-600">{labels.total}</p>
        <p className="mt-1 text-3xl font-semibold tabular-nums text-stone-900">
          {isValid ? `${formatPrice(total)} ₸` : '—'}
        </p>
        <p className="mt-1 text-sm text-stone-500">
          {formatPrice(price)} ₸ / {unitLabel}
        </p>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-stone-500">{labels.note}</p>

      <a
        href={whatsappLink(whatsappPhone, message)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-5 font-medium text-white transition-transform hover:scale-[1.01] active:scale-[0.99]"
      >
        <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden="true">
          <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35M12.04 21.5h-.01a9.5 9.5 0 0 1-4.84-1.33l-.35-.2-3.6.94.96-3.51-.23-.36a9.44 9.44 0 0 1-1.45-5.05c0-5.23 4.27-9.49 9.52-9.49 2.54 0 4.93.99 6.73 2.79a9.42 9.42 0 0 1 2.79 6.71c0 5.23-4.27 9.5-9.52 9.5m8.1-17.6A11.4 11.4 0 0 0 12.04.5C5.75.5.63 5.6.63 11.88c0 2 .53 3.96 1.53 5.69L.53 23.5l6.08-1.59a11.44 11.44 0 0 0 5.43 1.38h.01c6.29 0 11.41-5.11 11.41-11.39 0-3.04-1.19-5.9-3.34-8.05" />
        </svg>
        {labels.whatsapp}
      </a>
    </section>
  );
}
