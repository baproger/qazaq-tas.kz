import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'QAZAQ TAS GROUP — производство изделий из мраморного композита',
    template: '%s | QAZAQ TAS GROUP',
  },
  description:
    'QAZAQ TAS GROUP — производство брусчатки, бордюров, дренажных систем, МАФ и изделий ' +
    'из мраморного композита. Собственное производство, доставка по Казахстану.',
  keywords: [
    'брусчатка',
    'бордюр',
    'мраморный композит',
    'дренажные системы',
    'МАФ',
    'благоустройство',
    'Казахстан',
  ],
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
