import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { getBootstrap, isLocale, translator, whatsappLink } from '@/lib/site';
import '../globals.css';

export async function generateStaticParams() {
  return [{ locale: 'ru' }, { locale: 'kk' }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const { dictionary } = await getBootstrap(locale);
  const t = translator(dictionary);

  return {
    title: {
      default: `QAZAQ TAS GROUP — ${t('hero.title')}`,
      template: '%s | QAZAQ TAS GROUP',
    },
    description: t('hero.subtitle'),
    alternates: {
      languages: { ru: '/ru', kk: '/kk' },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const { dictionary, settings } = await getBootstrap(locale);
  const t = translator(dictionary);

  const phone = settings['company.phone'] ?? '';
  const whatsapp = settings['company.whatsapp'] ?? '';
  const address = settings[locale === 'kk' ? 'company.addressKk' : 'company.addressRu'] ?? '';
  const hours = settings[locale === 'kk' ? 'company.workHoursKk' : 'company.workHoursRu'] ?? '';

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900">
      <SiteHeader
        locale={locale}
        phone={phone}
        labels={{
          catalog: t('nav.catalog'),
          about: t('nav.about'),
          production: t('nav.production'),
          contacts: t('nav.contacts'),
        }}
      />

      <div className="flex-1">{children}</div>

      <footer id="contacts" className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-base font-semibold">QAZAQ TAS GROUP</p>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-stone-600">
                {t('hero.tagline')}
              </p>
            </div>

            <div>
              <h2 className="text-sm font-medium">{t('contacts.title')}</h2>
              <ul className="mt-3 space-y-2 text-sm text-stone-600">
                {phone && (
                  <li>
                    <a
                      href={`tel:${phone.replace(/[^\d+]/g, '')}`}
                      className="hover:text-stone-900"
                    >
                      {phone}
                    </a>
                  </li>
                )}
                {settings['company.email'] && (
                  <li>
                    <a
                      href={`mailto:${settings['company.email']}`}
                      className="hover:text-stone-900"
                    >
                      {settings['company.email']}
                    </a>
                  </li>
                )}
                {address && <li>{address}</li>}
                {hours && <li className="text-stone-500">{hours}</li>}
              </ul>
            </div>

            <div>
              {whatsapp && (
                <a
                  href={whatsappLink(whatsapp, 'Здравствуйте! У меня вопрос по продукции.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center rounded-lg bg-[#25D366] px-5 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
                >
                  {t('hero.cta.secondary')}
                </a>
              )}
            </div>
          </div>

          <p className="mt-10 border-t border-stone-200 pt-6 text-sm text-stone-500">
            © {new Date().getFullYear()} QAZAQ TAS GROUP. {t('footer.rights')}.
          </p>
        </div>
      </footer>
    </div>
  );
}
