import { useTranslation } from 'react-i18next';
import FadeIn from './FadeIn';
import { STACK_GROUP_IDS } from '@/content/profile';

/**
 * Sección "Stack".
 *
 * Las herramientas se agrupan por dominio, no por fabricante: "nube e
 * infraestructura" se lee mejor que una lista alfabética de 40
 * productos, y deja ver cómo se usa cada familia de tecnología.
 */
export default function Stack() {
  const { t } = useTranslation('stack');

  return (
    <section id="stack" className="bg-white py-section">
      <div className="mx-auto max-w-content px-gutter">
        <FadeIn>
          <p className="text-eyebrow uppercase text-brand-700">{t('eyebrow')}</p>
          <h2 className="mt-3 max-w-3xl text-title text-ink-900">{t('title')}</h2>
          <p className="mt-4 max-w-2xl text-lede text-ink-600">{t('lede')}</p>
        </FadeIn>

        <ul className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {STACK_GROUP_IDS.map((groupId, index) => {
            const items = t(`groups.${groupId}.items`, {
              returnObjects: true,
            }) as string[];

            return (
              <FadeIn key={groupId} delay={index * 80}>
                <li className="flex h-full flex-col rounded-card border border-ink-100 bg-ink-50 p-6">
                  <h3 className="text-subtitle text-ink-900">
                    {t(`groups.${groupId}.title`)}
                  </h3>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {items.map((item) => (
                      <li
                        key={item}
                        className="rounded-pill border border-ink-200 bg-white px-3 py-1 text-small text-ink-700"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </li>
              </FadeIn>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
