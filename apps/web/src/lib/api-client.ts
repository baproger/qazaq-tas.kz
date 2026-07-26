'use client';

import { API_URL, getAccessToken } from './auth';

/** Запрос к API с токеном авторизации и понятной ошибкой. */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAccessToken();

  // Сетевую ошибку браузера («Failed to fetch») переводим в понятный текст:
  // администратору нужно знать, что делать, а не видеть сообщение движка.
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  }).catch(() => {
    throw new Error('Сервер не отвечает. Проверьте, запущен ли API, и попробуйте ещё раз.');
  });

  if (response.status === 204) return undefined as T;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message;
    throw new Error(Array.isArray(message) ? message.join('. ') : (message ?? 'Ошибка запроса'));
  }

  return data as T;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  _count?: { products: number };
}

export interface ProductImage {
  id: string;
  url: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  unit: string;
  price: string;
  dimensions: string | null;
  colors: string[] | null;
  specs: Record<string, string> | null;
  inStock: boolean;
  isPublished: boolean;
  sortOrder: number;
  shortDescription: string | null;
  description: string | null;
  categoryId: string;
  category?: { id: string; name: string };
  images?: ProductImage[];
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
