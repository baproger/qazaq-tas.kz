'use client';

import type { AuthUser } from '@qazaq-tas/shared';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

const ACCESS_KEY = 'qt_access_token';
const REFRESH_KEY = 'qt_refresh_token';

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export function saveSession(result: LoginResult): void {
  localStorage.setItem(ACCESS_KEY, result.accessToken);
  localStorage.setItem(REFRESH_KEY, result.refreshToken);
}

export function clearSession(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export async function login(email: string, password: string): Promise<LoginResult> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }).catch(() => {
    throw new Error('Сервер не отвечает. Проверьте, запущен ли API, и попробуйте ещё раз.');
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(Array.isArray(data.message) ? data.message[0] : data.message);
  }
  return data as LoginResult;
}

export async function logout(): Promise<void> {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (refreshToken) {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => undefined);
  }
  clearSession();
}

/** Возвращает текущего пользователя или null, если сессии нет. */
export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const token = getAccessToken();
  if (!token) return null;

  const response = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 401) {
    return refreshSession();
  }
  if (!response.ok) return null;

  return (await response.json()) as AuthUser;
}

/** Пробует продлить сессию по refresh-токену. */
async function refreshSession(): Promise<AuthUser | null> {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) return null;

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    clearSession();
    return null;
  }

  const result = (await response.json()) as LoginResult;
  saveSession(result);
  return result.user;
}
