import { useTranslation } from 'react-i18next';
import FadeIn from './FadeIn';
import { EXPERIENCE_IDS } from '@/content/profile';

/**
 * Sección "Experiencia".
 *
 * Cada puesto es una entrada de bitácora, no una tarjeta: un riel de
 * metadatos a la izquierda (periodo y lugar), un eje vertical con un
 * nodo por puesto, y el trabajo a la derecha. La entrada ocupa todo el
 * ancho del contenido, así que el riel se lee como columna y el texto
 * se queda en una medida legible.
 *
 * No hay caja ni barra de color a la izquierda: la separación la
 * hace el eje, que es un filete neutro con un nodo de marca. El
 * cauce del riel y la posición del eje salen de las variables de
 * `.timeline` (ver `src/index.css`), así que no pueden desalinearse.
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
          <p className="section-eyebrow text-eyebrow uppercase text-brand-700">
            {t('eyebrow')}
          </p>
          <h2 className="mt-4 max-w-3xl text-balance text-title text-ink-900">
            {t('title')}
          </h2>
          <p className="mt-5 max-w-2xl text-pretty text-lede text-ink-600">{t('lede')}</p>
        </FadeIn>

        <ol className="timeline mt-14 space-y-[var(--timeline-gap)]">
          {EXPERIENCE_IDS.map((id, index) => {
            const highlights = t(`items.${id}.highlights`, {
              returnObjects: true,
            }) as string[];

            return (
              <li key={id}>
                <FadeIn
                  delay={index * 80}
                  className="timeline-entry grid gap-x-[var(--timeline-gutter)] gap-y-4 lg:grid-cols-[var(--timeline-rail)_minmax(0,1fr)]"
                >
                  <div className="lg:pt-1">
                    <p className="text-small font-semibold tabular-nums text-ink-700">
                      {t(`items.${id}.period`)}
                    </p>
                    <p className="mt-1 text-small text-ink-500">
                      {t(`items.${id}.location`)}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-balance text-subtitle text-ink-900">
                      {t(`items.${id}.role`)}
                    </h3>
                    <p className="mt-1 text-body font-medium text-brand-800">
                      {t(`items.${id}.employer`)}
                    </p>

                    <ul className="mt-6 max-w-reading space-y-3">
                      {highlights.map((highlight) => (
                        <li
                          key={highlight.slice(0, 32)}
                          className="relative pl-6 text-pretty text-body text-ink-700 before:absolute before:top-2.5 before:left-0 before:h-1.5 before:w-1.5 before:rounded-pill before:bg-brand-400"
                        >
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <span aria-hidden className="timeline-axis" />
                  <span aria-hidden className="timeline-node" />
                </FadeIn>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
