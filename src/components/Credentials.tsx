import { useTranslation } from 'react-i18next';
import FadeIn from './FadeIn';
import { CREDENTIAL_GROUP_IDS } from '@/content/profile';

/**
 * Sección "Credenciales".
 *
 * Formación, certificaciones, programación competitiva e idiomas. Los
 * años van en `detail`, que es opcional: los idiomas no tienen año.
 */
export default function Credentials() {
  const { t } = useTranslation('credentials');

  return (
    <section id="credenciales" className="bg-white py-section">
      <div className="mx-auto max-w-content px-gutter">
        <FadeIn>
          <p className="section-eyebrow text-eyebrow uppercase text-brand-700">
            {t('eyebrow')}
          </p>
          <h2 className="mt-4 max-w-3xl text-balance text-title text-ink-900">
            {t('title')}
          </h2>
        </FadeIn>

        <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {CREDENTIAL_GROUP_IDS.map((groupId, index) => {
            const items = t(`groups.${groupId}.items`, {
              returnObjects: true,
            }) as Array<{
              id: string;
              primary: string;
              secondary: string;
              detail: string;
            }>;

            return (
              <FadeIn key={groupId} delay={index * 80}>
                <li className="flex h-full flex-col rounded-card border border-ink-100 bg-ink-50 p-6">
                  {/* `min-h-[2lh]`: "Programación competitiva" ocupa dos
                      líneas y sin este mínimo desplaza el contenido de
                      su tarjeta respecto a las de sus vecinas. */}
                  <h3 className="min-h-[2lh] text-eyebrow uppercase text-brand-700">
                    {t(`groups.${groupId}.title`)}
                  </h3>
                  <ul className="mt-4 space-y-4">
                    {items.map((item) => (
                      <li key={item.id}>
                        <p className="text-pretty text-body font-semibold text-ink-900">
                          {item.primary}
                        </p>
                        <p className="mt-0.5 text-small text-ink-600">
                          {item.secondary}
                          {item.detail ? ` · ${item.detail}` : ''}
                        </p>
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
