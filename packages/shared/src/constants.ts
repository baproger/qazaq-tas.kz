/** Константы предметной области QAZAQ TAS GROUP. */

/** Валюта учёта — казахстанский тенге */
export const CURRENCY = 'KZT' as const;
export const CURRENCY_SYMBOL = '₸' as const;

/** Ставка НДС в Казахстане, % */
export const VAT_RATE = 12;

/** Часовой пояс компании (Астана) */
export const COMPANY_TIMEZONE = 'Asia/Almaty' as const;

/** Постраничный вывод по умолчанию */
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/** Категории продукции (базовые, редактируются в админке) */
export const PRODUCT_CATEGORIES = [
  { slug: 'bruschatka', name: 'Брусчатка' },
  { slug: 'bordyur', name: 'Бордюр' },
  { slug: 'drenazh', name: 'Дренажные системы' },
  { slug: 'maf', name: 'МАФ' },
  { slug: 'naturalnyy-kamen', name: 'Натуральный камень' },
  { slug: 'blagoustroystvo', name: 'Благоустройство' },
] as const;
