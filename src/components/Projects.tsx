import { useTranslation } from 'react-i18next';
import FadeIn from './FadeIn';
import { ArrowRightIcon } from './Icons';
import { GITHUB_PROFILE_URL, PROJECT_IDS } from '@/content/profile';

/**
 * Sección "Proyectos".
 *
 * Los repositorios públicos con el código, la documentación y las
 * decisiones de diseño a la vista. Cada tarjeta enlaza al repositorio;
 * el enlace al final lleva al perfil completo de GitHub.
 */
export default function Projects() {
  const { t } = useTranslation('projects');

  return (
    <section id="proyectos" className="bg-ink-50 py-section">
      <div className="mx-auto max-w-content px-gutter">
        <FadeIn>
          <p className="text-eyebrow uppercase text-brand-700">{t('eyebrow')}</p>
          <h2 className="mt-3 max-w-3xl text-title text-ink-900">{t('title')}</h2>
          <p className="mt-4 max-w-2xl text-lede text-ink-600">{t('lede')}</p>
        </FadeIn>

        <ul className="mt-14 grid gap-6 lg:grid-cols-3">
          {PROJECT_IDS.map((projectId, index) => {
            const tags = t(`items.${projectId}.tags`, {
              returnObjects: true,
            }) as string[];
            const href = t(`items.${projectId}.href`) as string;

            return (
              <FadeIn key={projectId} delay={index * 100}>
                <li className="flex h-full flex-col rounded-card border border-ink-100 bg-white p-6 shadow-card">
                  <h3 className="text-subtitle text-ink-900">
                    {t(`items.${projectId}.title`)}
                  </h3>
                  <p className="mt-3 flex-1 text-body text-ink-700">
                    {t(`items.${projectId}.summary`)}
                  </p>

                  <ul className="mt-5 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-pill bg-brand-50 px-3 py-1 text-small text-brand-800"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>

                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-2 border-t border-ink-100 pt-4 text-small font-semibold text-brand-700 transition-colors duration-200 ease-out-quint hover:text-brand-900"
                  >
                    {t(`items.${projectId}.linkLabel`)}
                    <ArrowRightIcon className="h-4 w-4" />
                  </a>
                </li>
              </FadeIn>
            );
          })}
        </ul>

        <FadeIn>
          <a
            href={GITHUB_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex items-center gap-2 text-body font-semibold text-brand-700 transition-colors duration-200 ease-out-quint hover:text-brand-900"
          >
            {t('profileLink.label')}
            <ArrowRightIcon className="h-5 w-5" />
          </a>
        </FadeIn>
      </div>
    </section>
  );
}
