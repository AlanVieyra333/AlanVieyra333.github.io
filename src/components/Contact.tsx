import { Trans, useTranslation } from 'react-i18next';
import FadeIn from './FadeIn';
import { IS_CONTACT_CONFIGURED } from '@/config';
import { CONTACT, CONTACT_CHANNELS } from '@/contactChannels';

/**
 * Sección de contacto.
 *
 * Los `title`, `detail` y `cta` de cada canal vienen del namespace
 * `contact.channels` en el JSON de i18n; los hrefs y los iconos
 * siguen siendo datos estructurales (en `@/contactChannels`) y no
 * se traducen.
 */
export default function Contact() {
  const { t } = useTranslation('contact');
  return (
    <section id="contacto" className="bg-ink-50 py-section">
      <div className="mx-auto max-w-content px-gutter">
        <FadeIn>
          <p className="section-eyebrow text-eyebrow uppercase text-brand-700">
            {t('eyebrow')}
          </p>
          <h2 className="mt-4 max-w-3xl text-balance text-title text-ink-900">
            {t('title')}
          </h2>
          <p className="mt-5 max-w-2xl text-pretty text-lede text-ink-600">
            {t('lede', { responseTimeNote: CONTACT.responseTimeNote })}
          </p>
        </FadeIn>

        {!IS_CONTACT_CONFIGURED && (
          <FadeIn delay={100}>
            <p
              role="status"
              className="mt-6 max-w-2xl rounded-card border border-accent-300 bg-accent-100 p-4 text-small text-accent-700"
            >
              {t('notConfigured.title')}{' '}
              <Trans
                i18nKey="notConfigured.body"
                ns="contact"
                components={{ code: <code className="font-mono" /> }}
              />
            </p>
          </FadeIn>
        )}

        <ul className="mt-12 grid gap-6 md:grid-cols-2">
          {CONTACT_CHANNELS.map((channel, index) => {
            const Icon = channel.Icon;
            return (
              <FadeIn key={channel.id} delay={index * 120}>
                <li>
                  <a
                    href={channel.href}
                    target={channel.id === 'whatsapp' ? '_blank' : undefined}
                    rel={channel.id === 'whatsapp' ? 'noopener noreferrer' : undefined}
                    className="group flex h-full flex-col rounded-card border border-ink-100 bg-white p-8 shadow-card transition-[border-color,box-shadow] duration-200 ease-out-quint hover:border-brand-300 hover:shadow-lift"
                  >
                    <span
                      className="inline-flex h-12 w-12 items-center justify-center rounded-card bg-brand-700 text-white"
                      aria-hidden="true"
                    >
                      <Icon className="h-6 w-6" />
                    </span>
                    <h3 className="mt-5 text-balance text-subtitle text-ink-900">
                      {t(`channels.${channel.id}.title`)}
                    </h3>
                    <p className="mt-3 text-pretty text-body text-ink-700">
                      {t(`channels.${channel.id}.detail`)}
                    </p>
                    <span className="mt-6 inline-flex items-center gap-2 text-small font-semibold text-brand-700 group-hover:text-brand-900">
                      {t(`channels.${channel.id}.cta`)}
                      <span aria-hidden="true">→</span>
                    </span>
                  </a>
                </li>
              </FadeIn>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
