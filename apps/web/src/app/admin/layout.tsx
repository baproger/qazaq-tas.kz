'use client';

import { UserRole, UserRoleLabel } from '@qazaq-tas/shared';
import type { AuthUser } from '@qazaq-tas/shared';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchCurrentUser, logout } from '@/lib/auth';

/** Разделы системы и роли, которым они доступны. */
const SECTIONS = [
  { name: 'Обзор', href: '/admin', roles: null, ready: true },
  {
    name: 'Клиенты и лиды',
    href: '/admin/crm',
    roles: [UserRole.DIRECTOR, UserRole.SALES_MANAGER, UserRole.ADMIN],
    ready: false,
  },
  {
    name: 'Сделки и счета',
    href: '/admin/sales',
    roles: [UserRole.DIRECTOR, UserRole.SALES_MANAGER, UserRole.ACCOUNTANT, UserRole.ADMIN],
    ready: false,
  },
  {
    name: 'Каталог товаров',
    href: '/admin/catalog',
    roles: [UserRole.DIRECTOR, UserRole.SALES_MANAGER, UserRole.ADMIN],
    ready: true,
  },
  {
    name: 'Производство',
    href: '/admin/production',
    roles: [UserRole.DIRECTOR, UserRole.PRODUCTION, UserRole.ADMIN],
    ready: false,
  },
  {
    name: 'Склад',
    href: '/admin/warehouse',
    roles: [UserRole.DIRECTOR, UserRole.WAREHOUSE, UserRole.PRODUCTION, UserRole.ADMIN],
    ready: false,
  },
  {
    name: 'Логистика',
    href: '/admin/logistics',
    roles: [UserRole.DIRECTOR, UserRole.WAREHOUSE, UserRole.ADMIN],
    ready: false,
  },
  {
    name: 'Финансы',
    href: '/admin/finance',
    roles: [UserRole.DIRECTOR, UserRole.ACCOUNTANT, UserRole.ADMIN],
    ready: false,
  },
  {
    name: 'Пользователи',
    href: '/admin/users',
    roles: [UserRole.DIRECTOR, UserRole.ADMIN],
    ready: false,
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetchCurrentUser()
      .then((current) => {
        if (!current) {
          router.replace('/login');
          return;
        }
        setUser(current);
        setChecking(false);
      })
      .catch(() => router.replace('/login'));
  }, [router]);

  if (checking || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-[var(--muted-foreground)]">
        Проверка доступа...
      </div>
    );
  }

  const visible = SECTIONS.filter(
    (section) => section.roles === null || section.roles.includes(user.role as never),
  );

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 shrink-0 border-r bg-[var(--card)]">
        <div className="border-b px-5 py-4">
          <p className="text-sm font-semibold">QAZAQ TAS</p>
          <p className="text-xs text-[var(--muted-foreground)]">Система управления</p>
        </div>

        <nav className="p-3">
          <ul className="space-y-1">
            {visible.map((section) => (
              <li key={section.href}>
                <Link
                  href={section.ready ? section.href : '#'}
                  aria-disabled={!section.ready}
                  className={
                    section.ready
                      ? 'flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-[var(--secondary)]'
                      : 'flex cursor-not-allowed items-center justify-between rounded-md px-3 py-2 text-sm text-[var(--muted-foreground)]'
                  }
                >
                  {section.name}
                  {!section.ready && <span className="text-[10px] uppercase">скоро</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-[var(--card)] px-6 py-3">
          <div>
            <p className="text-sm font-medium">{user.fullName}</p>
            <p className="text-xs text-[var(--muted-foreground)]">
              {UserRoleLabel[user.role as UserRole]} · {user.email}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-[var(--secondary)]"
          >
            Выйти
          </button>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
