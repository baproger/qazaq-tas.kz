import { PRODUCT_CATEGORIES } from '@qazaq-tas/shared';

/**
 * Временная главная страница этапа 0.
 * На этапе 3 заменяется полноценным сайтом: о компании, объекты,
 * производство, каталог, отзывы, формы заявок.
 */

const MODULES = [
  { name: 'Сайт и каталог', stage: 'Этапы 2–3', ready: false },
  { name: 'CRM и лиды', stage: 'Этап 4', ready: false },
  { name: 'WhatsApp (Kelesu)', stage: 'Этап 4', ready: false },
  { name: 'Продажи, КП и счета', stage: 'Этап 5', ready: false },
  { name: 'Производство (MES)', stage: 'Этап 6', ready: false },
  { name: 'Склад и закупки', stage: 'Этап 7', ready: false },
  { name: 'Логистика', stage: 'Этап 8', ready: false },
  { name: 'Финансы и аналитика', stage: 'Этапы 9–10', ready: false },
  { name: 'AI-помощник', stage: 'Этап 11', ready: false },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="border-b bg-[var(--primary)] text-[var(--primary-foreground)]">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
            Мраморный композит · Казахстан
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">QAZAQ TAS GROUP</h1>
          <p className="mt-5 max-w-2xl text-lg text-[var(--primary-foreground)]/80">
            Производство брусчатки, бордюров, дренажных систем, МАФ и изделий из натурального камня.
            Собственное производство полного цикла — от сырья до доставки на объект.
          </p>
          <div className="mt-8 inline-flex items-center gap-2 rounded-lg border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-4 py-2 text-sm">
            <span className="size-2 rounded-full bg-[var(--accent)]" />
            Сайт в разработке — цифровая ERP-система разворачивается
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-2xl font-semibold">Продукция</h2>
        <p className="mt-2 text-[var(--muted-foreground)]">
          Каталог наполняется через админ-панель на этапе 2.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCT_CATEGORIES.map((category) => (
            <li
              key={category.slug}
              className="rounded-xl border bg-[var(--card)] p-5 transition-colors hover:border-[var(--accent)]"
            >
              <h3 className="font-medium">{category.name}</h3>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">/{category.slug}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t bg-[var(--secondary)]">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="text-2xl font-semibold">Состояние системы</h2>
          <p className="mt-2 text-[var(--muted-foreground)]">
            Этап 0 завершён: монорепо, база данных MariaDB, API и веб-приложение подключены.
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {MODULES.map((module) => (
              <li
                key={module.name}
                className="flex items-center justify-between rounded-lg border bg-[var(--card)] px-4 py-3 text-sm"
              >
                <span>{module.name}</span>
                <span className="text-[var(--muted-foreground)]">{module.stage}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto max-w-5xl px-6 py-8 text-sm text-[var(--muted-foreground)]">
          © {new Date().getFullYear()} QAZAQ TAS GROUP · qazaq-tas.kz
        </div>
      </footer>
    </main>
  );
}
