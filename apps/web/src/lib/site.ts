/** Загрузка данных сайта на сервере — нужна для SEO и быстрой первой отрисовки. */

export const LOCALES = ['ru', 'kk'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'ru';

export const LOCALE_NAMES: Record<Locale, string> = { ru: 'Рус', kk: 'Қаз' };

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export interface SiteProduct {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  unit: string;
  price: number;
  priceMax: number | null;
  availability: 'IN_STOCK' | 'ON_ORDER' | 'ON_REQUEST';
  material: string | null;
  dimensions: string | null;
  measures: Array<{ label: string; value: string }>;
  colors: Array<{ name: string; hex: string | null }>;
  inStock: boolean;
  image: string | null;
  category: { slug: string; name: string };
}

export interface SiteProductDetail extends SiteProduct {
  description: string | null;
  images: string[];
  documents: Array<{ title: string; url: string }>;
  specs: Record<string, string>;
}

export interface SiteCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  productCount: number;
}

export interface SiteBanner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  linkText: string | null;
}

export interface SiteBootstrap {
  locale: Locale;
  dictionary: Record<string, string>;
  settings: Record<string, string>;
  banners: SiteBanner[];
  categories: SiteCategory[];
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

async function request<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${path}`, { next: { revalidate: 60 } });
    if (!response.ok) return fallback;
    return (await response.json()) as T;
  } catch {
    // Сайт должен открываться, даже если API временно недоступен.
    return fallback;
  }
}

export function getBootstrap(locale: Locale): Promise<SiteBootstrap> {
  return request<SiteBootstrap>(`/site/bootstrap?locale=${locale}`, {
    locale,
    dictionary: {},
    settings: {},
    banners: [],
    categories: [],
  });
}

export function getProducts(locale: Locale, category?: string): Promise<SiteProduct[]> {
  const query = category ? `&category=${encodeURIComponent(category)}` : '';
  return request<SiteProduct[]>(`/site/products?locale=${locale}${query}`, []);
}

export async function getProduct(locale: Locale, slug: string): Promise<SiteProductDetail | null> {
  return request<SiteProductDetail | null>(`/site/products/${slug}?locale=${locale}`, null);
}

/** Перевод по ключу; если строки нет — показываем ключ, чтобы пропажу было видно. */
export function translator(dictionary: Record<string, string>) {
  return (key: string): string => dictionary[key] ?? key;
}

/** Ссылка на WhatsApp с заранее подготовленным текстом обращения. */
export function whatsappLink(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(value);
}
