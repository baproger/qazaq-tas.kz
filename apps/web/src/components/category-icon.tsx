/**
 * Иконки категорий: нарисованы под продукцию завода, а не взяты из общего набора.
 * Подбираются по адресу категории; для новых категорий показывается общий знак.
 */
const PATHS: Record<string, React.ReactNode> = {
  // Брусчатка — укладка вразбежку
  bruschatka: (
    <>
      <rect x="3" y="5" width="8" height="5.5" rx="1" />
      <rect x="13" y="5" width="8" height="5.5" rx="1" opacity=".55" />
      <rect x="3" y="13.5" width="8" height="5.5" rx="1" opacity=".55" />
      <rect x="13" y="13.5" width="8" height="5.5" rx="1" />
    </>
  ),
  // Бордюр — вертикальный камень в разрезе
  bordyur: (
    <>
      <path d="M4 8h9a3 3 0 0 1 3 3v8H4z" />
      <rect x="17" y="11" width="3" height="8" rx="1" opacity=".55" />
    </>
  ),
  // Дренаж — лоток с решёткой
  drenazh: (
    <>
      <path d="M3 8h18v3H3z" opacity=".55" />
      <path d="M4 12h16l-1.5 8h-13z" />
      <path d="M8 8v3M12 8v3M16 8v3" stroke="#fff" strokeWidth="1.2" />
    </>
  ),
  // МАФ — скамья и урна
  maf: (
    <>
      <rect x="3" y="9" width="12" height="2.5" rx="1" />
      <path d="M5 11.5v6M13 11.5v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M17.5 10h4l-.7 9h-2.6z" opacity=".55" />
    </>
  ),
  // Натуральный камень — скол породы
  'naturalnyy-kamen': (
    <>
      <path d="M12 3 4 9l2.5 10h11L20 9z" opacity=".55" />
      <path d="m12 3 8 6-8 4-8-4z" />
    </>
  ),
  // Благоустройство — дорожка и озеленение
  blagoustroystvo: (
    <>
      <path d="M4 20c2-6 5-9 8-9s6 3 8 9z" opacity=".55" />
      <circle cx="7" cy="6" r="2.5" />
      <circle cx="17" cy="5" r="2" opacity=".7" />
    </>
  ),
};

const FALLBACK = (
  <>
    <rect x="3" y="5" width="8" height="6" rx="1" />
    <rect x="13" y="5" width="8" height="6" rx="1" opacity=".55" />
    <rect x="3" y="13" width="18" height="6" rx="1" opacity=".35" />
  </>
);

export function CategoryIcon({ slug, className }: { slug: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      {PATHS[slug] ?? FALLBACK}
    </svg>
  );
}
