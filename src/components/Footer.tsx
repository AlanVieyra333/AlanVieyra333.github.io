import { useTranslation } from 'react-i18next';
import { SITE_NAME } from '@/config';
import { SOCIALS } from '@/socials';
import Wordmark from './Wordmark';

export default function Footer() {
  const { t } = useTranslation('common');
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-ink-100 bg-white">
      <div className="mx-auto flex max-w-content flex-col gap-8 px-gutter py-12 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-subtitle font-bold tracking-tight">
            <Wordmark />
          </p>
          <p className="mt-2 text-small text-ink-600">
            {t('footer.tagline')}
          </p>
        </div>

        <nav aria-label={t('footer.socialsLabel')} className="flex flex-wrap items-center gap-4">
          {SOCIALS.map(({ id, label, href, Icon }) => (
            <a
              key={id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="inline-flex h-11 w-11 items-center justify-center rounded-pill text-ink-700 transition-colors duration-200 ease-out-quint hover:bg-ink-50 hover:text-brand-700"
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
            </a>
          ))}
        </nav>
      </div>

      <div className="border-t border-ink-100">
        <p className="mx-auto max-w-content px-gutter py-6 text-center text-small text-ink-500">
          {t('footer.copyright', { year, siteName: SITE_NAME })}
        </p>
      </div>
    </footer>
  );
}
