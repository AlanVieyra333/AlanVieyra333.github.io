import { useTranslation } from 'react-i18next';
import FadeIn from './FadeIn';
import { EXPERIENCE_IDS } from '@/content/profile';

/**
 * Sección "Experiencia".
 *
 * Cada puesto es una tarjeta con un filo de acento a la izquierda. El
 * orden es cronológico inverso: el puesto actual primero.
 *
 * Los textos vienen del namespace `experience` con el patrón
 * `items.<id>.<campo>`. Los identificadores son estables entre idiomas
 * (ver `src/content/profile.ts`).
 */
export default function Experience() {
  const { t } = useTranslation('experience');

  return (
    <section id="experiencia" className="bg-ink-50 py-section">
      <div className="mx-auto max-w-content px-gutter">
        <FadeIn>
          <p className="text-eyebrow uppercase text-brand-700">{t('eyebrow')}</p>
          <h2 className="mt-3 max-w-3xl text-title text-ink-900">{t('title')}</h2>
          <p className="mt-4 max-w-2xl text-lede text-ink-600">{t('lede')}</p>
        </FadeIn>

        <ol className="mt-14 space-y-6">
          {EXPERIENCE_IDS.map((id, index) => {
            const highlights = t(`items.${id}.highlights`, {
              returnObjects: true,
            }) as string[];

            return (
              <li key={id}>
                <FadeIn delay={index * 80}>
                  <article className="rounded-card border border-ink-100 border-l-4 border-l-brand-600 bg-white p-6 shadow-card sm:p-8">
                    <header className="flex flex-col gap-1 border-b border-ink-100 pb-5 sm:flex-row sm:items-baseline sm:justify-between">
                      <div>
                        <h3 className="text-subtitle text-ink-900">
                          {t(`items.${id}.role`)}
                        </h3>
                        <p className="mt-1 text-body font-medium text-brand-800">
                          {t(`items.${id}.employer`)}
                        </p>
                      </div>
                      <p className="text-small whitespace-nowrap text-ink-500 sm:text-right">
                        {t(`items.${id}.period`)}
                        <span className="block">{t(`items.${id}.location`)}</span>
                      </p>
                    </header>

                    <ul className="mt-5 space-y-3">
                      {highlights.map((highlight) => (
                        <li
                          key={highlight.slice(0, 32)}
                          className="relative pl-6 text-body text-ink-700 before:absolute before:top-2.5 before:left-0 before:h-1.5 before:w-1.5 before:rounded-pill before:bg-brand-400"
                        >
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </article>
                </FadeIn>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
