import { useTranslation } from 'react-i18next';
import FadeIn from './FadeIn';
import { METRIC_IDS } from '@/content/profile';

/**
 * Sección "Perfil".
 *
 * Dos bloques: la prosa (qué hago y desde dónde) y las cifras
 * (cuánto). Las cifras son las de `FACTS.md` del repositorio del
 * currículum — la misma fuente de verdad, no una segunda lista.
 *
 * El rail de cifras es **columna hermana** de la cabecera, no un bloque
 * aparte debajo: así el rótulo "EN NÚMEROS" arranca en la misma línea
 * base que "PERFIL" y ambos se leen como un par. Antes el panel vivía
 * en una fila aparte y quedaba colgando, desalineado del encabezado.
 *
 * En escritorio el rail se ancla (`sticky`) para que siga a la prosa
 * durante el scroll sin separarse del encabezado que lo introduce.
 */
export default function Profile() {
  const { t } = useTranslation('profile');
  const body = t('body', { returnObjects: true }) as string[];

  return (
    <section id="perfil" className="bg-white py-section">
      <div className="mx-auto max-w-content px-gutter">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <FadeIn>
              <p className="section-eyebrow text-eyebrow uppercase text-brand-700">
                {t('eyebrow')}
              </p>
              <h2 className="mt-4 max-w-2xl text-balance text-title text-ink-900">
                {t('title')}
              </h2>
              <p className="mt-5 max-w-xl text-pretty text-lede text-ink-600">
                {t('lede')}
              </p>
            </FadeIn>

            <FadeIn delay={80}>
              <div className="mt-10 max-w-reading space-y-5 border-t border-ink-200 pt-8">
                {body.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 32)}
                    className="text-pretty text-body text-ink-700"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={120}>
            <div className="lg:sticky lg:top-28">
              <p className="section-eyebrow text-eyebrow uppercase text-brand-700">
                {t('metrics.eyebrow')}
              </p>
              <dl className="mt-6 rounded-card border border-ink-100 bg-ink-50 p-6">
                {METRIC_IDS.map((id) => (
                  <div
                    key={id}
                    className="border-b border-ink-200 py-5 first:pt-0 last:border-0 last:pb-0"
                  >
                    <dt className="text-stat tabular-nums text-brand-800">
                      {t(`metrics.items.${id}.value`)}
                    </dt>
                    <dd className="mt-1.5 text-pretty text-small text-ink-600">
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
