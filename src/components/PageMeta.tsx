import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  canonicalUrl,
  OG_IMAGE,
  OG_IMAGE_WIDTH,
  OG_IMAGE_HEIGHT,
  OWNER_FULL_NAME,
} from '@/config';
import {
  SUPPORTED_LOCALES,
  toOgLocale,
  type Locale,
  localePath,
} from '@/i18n/locales';
import { useLocale } from '@/i18n/useLocale';

interface PageMetaProps {
  readonly title: string;
  readonly description: string;
  /** Path interno (sin prefijo de locale). Ej. `/`. */
  readonly path: string;
  readonly noindex?: boolean;
  /** Imagen social específica de la página. Si se omite, se usa la OG por defecto. */
  readonly ogImage?: string;
  /** Tipo de schema.org para JSON-LD (opcional). */
  readonly schemaType?: 'home' | 'none';
  /** Locale activo. Si se omite, se lee del `useLocale()`. */
  readonly locale?: Locale;
}

const LANG_FOR_OG: Record<Locale, string> = {
  'es-MX': 'es_MX',
  'en-US': 'en_US',
};

/**
 * Metadatos por página, conscientes del locale.
 *
 * Lo que este componente renderiza por locale:
 *
 *   - `<title>` localizado vía `useTranslation('meta')` para asegurar
 *     consistencia del título en head.
 *   - `<html lang="...">` se actualiza en `Layout` para no duplicar
 *     aquí.
 *   - `canonical` apunta a la URL con el locale activo.
 *   - `og:locale` usa el formato Open Graph (`es_MX`).
 *   - `og:locale:alternate` lista los otros locales.
 *   - `hreflang` recíproco para cada locale soportado.
 *   - `hreflang x-default` apunta a `/es-MX/` (idioma por defecto).
 *
 * Nota: `react-refresh` exige que los default exports sean
 * componentes puros; toda la lógica de armado vive aquí dentro.
 */
export default function PageMeta({
  title,
  description,
  path,
  noindex = false,
  ogImage,
  schemaType,
  locale: localeProp,
}: PageMetaProps) {
  const { t: metaT } = useTranslation('meta');
  const { locale: contextLocale } = useLocale();
  const locale = localeProp ?? contextLocale;

  const fullTitle = `${title} · ${metaT('siteName')}`;
  const url = canonicalUrl(localePath(locale, path));
  const image = ogImage ?? OG_IMAGE;
  const imageAlt = `${metaT('siteName')} — ${title}`;

  const otherLocales = SUPPORTED_LOCALES.filter((l) => l !== locale);

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* hreFlang — un tag por locale soportado + x-default */}
      {SUPPORTED_LOCALES.map((l) => (
        <link
          key={l}
          rel="alternate"
          hrefLang={l}
          href={canonicalUrl(localePath(l, path))}
        />
      ))}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={canonicalUrl(localePath('es-MX', path))}
      />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={metaT('siteName')} />
      <meta property="og:locale" content={LANG_FOR_OG[locale]} />
      {otherLocales.map((l) => (
        <meta
          key={l}
          property="og:locale:alternate"
          content={toOgLocale(l)}
        />
      ))}
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:type" content="image/svg+xml" />
      <meta property="og:image:width" content={String(OG_IMAGE_WIDTH)} />
      <meta property="og:image:height" content={String(OG_IMAGE_HEIGHT)} />
      <meta property="og:image:alt" content={imageAlt} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={imageAlt} />

      {noindex ? <meta name="robots" content="noindex, nofollow" /> : null}
      {renderSchema(schemaType, url, description, locale, metaT)}
    </>
  );
}

type MetaTranslator = (key: string, options?: Record<string, unknown>) => string;

function renderSchema(
  type: PageMetaProps['schemaType'],
  url: string,
  description: string,
  locale: Locale,
  t: MetaTranslator,
): ReactNode {
  if (type === undefined || type === 'none') return null;
  if (type === 'home') {
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: OWNER_FULL_NAME,
            jobTitle: t('ownerRole'),
            url,
            workLocation: { '@type': 'Place', name: 'Ciudad de México, México' },
            description,
            knowsLanguage: ['es-MX', 'en-US'],
            inLanguage: locale,
            sameAs: [
              'https://github.com/AlanVieyra333',
              'https://www.linkedin.com/in/alanvieyra333',
            ],
          }),
        }}
      />
    );
  }
  return null;
}

/**
 * Re-export para mantener la firma idéntica a la versión previa en
 * otros archivos que importaban utilidades derivadas.
 */
export { SUPPORTED_LOCALES };
