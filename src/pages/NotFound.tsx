import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageMeta from '@components/PageMeta';
import { useLocale } from '@/i18n/useLocale';

/**
 * Página de error 404.
 *
 * El título, la descripción y los CTAs vienen del namespace `notFound`.
 * Los metadatos (`<title>`, `<meta description>`) se localizan
 * automáticamente desde `meta.json` vía `PageMeta`.
 */
export default function NotFound() {
  const { t } = useTranslation('notFound');
  const { locale, localizedPath } = useLocale();
  const location = useLocation();

  // Construimos el path relativo al locale para que `PageMeta` no
  // emita `og:url` que apunte al root.
  const stripped = location.pathname.replace(/^\/[^/]+/, '') || '/';

  return (
    <>
      <PageMeta
        title={t('title')}
        description={t('lede')}
        path={stripped}
        locale={locale}
        noindex
      />
      <section className="bg-white">
        <div className="mx-auto flex min-h-[60vh] max-w-content flex-col items-start justify-center gap-6 px-gutter py-section">
          <p className="text-eyebrow uppercase text-brand-700">{t('eyebrow')}</p>
          <h1 className="max-w-2xl text-title text-ink-900">{t('title')}</h1>
          <p className="max-w-xl text-lede text-ink-600">{t('lede')}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              to={localizedPath('/')}
              className="inline-flex items-center justify-center rounded-card bg-brand-700 px-5 py-3 text-small font-semibold text-white transition-colors duration-200 ease-out-quint hover:bg-brand-800"
            >
              {t('homeCta')}
            </Link>
            <Link
              to={`${localizedPath('/')}#proyectos`}
              className="inline-flex items-center justify-center rounded-card border border-ink-200 px-5 py-3 text-small font-semibold text-ink-800 transition-colors duration-200 ease-out-quint hover:border-brand-300 hover:text-brand-700"
            >
              {t('projectsCta')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
