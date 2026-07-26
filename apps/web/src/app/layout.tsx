import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  // Заголовок и описание задаёт языковой макет (app/[locale]/layout.tsx),
  // здесь только запасной вариант для страниц вне языковых маршрутов.
  title: 'QAZAQ TAS GROUP',
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2b2724',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
