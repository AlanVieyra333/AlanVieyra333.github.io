import { useTranslation } from 'react-i18next';
import FadeIn from './FadeIn';
import { METRIC_IDS } from '@/content/profile';

/**
 * Sección "Perfil".
 *
 * Dos bloques: la prosa (qué hago y desde dónde) y las cifras
 * (cuánto). Las cifras son las de `FACTS.md` del repositorio del
 * currículum — la misma fuente de verdad, no una segunda lista.
 */
export default function Profile() {
  const { t } = useTranslation('profile');
  const body = t('body', { returnObjects: true }) as string[];

  return (
    <section id="perfil" className="bg-white py-section">
      <div className="mx-auto max-w-content px-gutter">
        <FadeIn>
          <p className="text-eyebrow uppercase text-brand-700">{t('eyebrow')}</p>
          <h2 className="mt-3 max-w-3xl text-title text-ink-900">{t('title')}</h2>
          <p className="mt-4 max-w-2xl text-lede text-ink-600">{t('lede')}</p>
        </FadeIn>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <FadeIn>
            <div className="space-y-5">
              {body.map((paragraph) => (
                <p key={paragraph.slice(0, 32)} className="text-body text-ink-700">
                  {paragraph}
                </p>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={120}>
            <div className="rounded-card border border-ink-100 bg-ink-50 p-6">
              <p className="text-eyebrow uppercase text-brand-700">
                {t('metrics.eyebrow')}
              </p>
              <dl className="mt-6 space-y-5">
                {METRIC_IDS.map((id) => (
                  <div key={id} className="border-b border-ink-200 pb-5 last:border-0 last:pb-0">
                    <dt className="text-title font-bold tracking-tight text-brand-800">
                      {t(`metrics.items.${id}.value`)}
                    </dt>
                    <dd className="mt-1 text-small text-ink-600">
                      {t(`metrics.items.${id}.label`)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
