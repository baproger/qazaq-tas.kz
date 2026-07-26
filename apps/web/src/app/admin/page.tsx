'use client';

/**
 * Обзорная страница админки.
 * Показатели подключаются по мере готовности модулей (этапы 4–10).
 */
const NEXT_STEPS = [
  { name: 'Каталог товаров и контент сайта', stage: 'Этап 2' },
  { name: 'Публичный сайт с формами заявок', stage: 'Этап 3' },
  { name: 'CRM, лиды и WhatsApp', stage: 'Этап 4' },
  { name: 'Сделки, КП и счета', stage: 'Этап 5' },
  { name: 'Производство и техкарты', stage: 'Этап 6' },
  { name: 'Склад и закупки', stage: 'Этап 7' },
];

export default function AdminOverviewPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Обзор</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Вход в систему работает. Разделы подключаются по мере готовности модулей.
        </p>
      </div>

      <section className="rounded-xl border bg-[var(--card)] p-6">
        <h2 className="text-sm font-medium">Что уже работает</h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
          <li>Авторизация: вход, продление сессии, выход со всех устройств</li>
          <li>Роли и доступы: разделы меню видны по роли пользователя</li>
          <li>Журнал действий: входы записываются в базу</li>
          <li>База данных MariaDB и API с документацией</li>
        </ul>
      </section>

      <section>
        <h2 className="text-sm font-medium">Ближайшие разделы</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {NEXT_STEPS.map((step) => (
            <li
              key={step.name}
              className="flex items-center justify-between rounded-lg border bg-[var(--card)] px-4 py-3 text-sm"
            >
              <span>{step.name}</span>
              <span className="text-[var(--muted-foreground)]">{step.stage}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
