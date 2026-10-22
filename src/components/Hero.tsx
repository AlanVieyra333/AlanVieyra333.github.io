import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HeroArt from './HeroArt';
import { OWNER_NAME } from '@/config';
import { CV_RELEASES_URL } from '@/content/profile';
import { useLocale } from '@/i18n/useLocale';

export default function Hero() {
  const { t } = useTranslation('home');
  const { localizedPath } = useLocale();
  return (
    <section className="relative isolate overflow-hidden bg-brand-950 text-white">
      <HeroArt />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-950/85 via-brand-950/75 to-brand-950"
      />

      <div className="mx-auto flex min-h-[78svh] max-w-content flex-col justify-center px-gutter py-section">
        <p className="text-eyebrow uppercase text-accent-300">{t('hero.eyebrow')}</p>
        <h1 className="mt-5 max-w-3xl text-display text-white">{t('hero.title')}</h1>
        <p className="mt-6 max-w-2xl text-lede text-brand-100">
          {t('hero.lede', { ownerName: OWNER_NAME })}
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          {/* El CV vive en los releases del repositorio del currículum: el
              enlace apunta siempre a la última versión, nunca a un PDF
              suelto que pueda quedar desactualizado. */}
          <a
            href={CV_RELEASES_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-card bg-accent-500 px-6 py-3 text-body font-semibold text-brand-950 transition-colors duration-200 ease-out-quint hover:bg-accent-300"
          >
            {t('hero.primaryCta')}
          </a>
          <Link
            to={`${localizedPath('/')}#proyectos`}
            className="inline-flex items-center justify-center rounded-card border border-brand-200/40 px-6 py-3 text-body font-semibold text-white transition-colors duration-200 ease-out-quint hover:border-white hover:bg-white/5"
          >
            {t('hero.secondaryCta')}
          </Link>
        </div>
      </div>
    </section>
  );
}
