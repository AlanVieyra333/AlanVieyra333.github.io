/**
 * Tipos y constantes relacionados con los locales soportados.
 *
 * Esta es la **única** fuente de verdad para los códigos de locale
 * que la aplicación entiende. Cualquier referencia a "es-MX" o
 * "en-US" en el código debe pasar por aquí.
 *
 * Distinciones que el resto del código debe respetar:
 *
 *   - **Language**     → "es", "en" (BCP-47 primary language subtag).
 *   - **Regional**     → "MX", "US" (BCP-47 region subtag).
 *   - **Locale**       → "es-MX", "en-US" (language + region).
 *   - **URL locale**   → "es-MX", "en-US" (mismo formato, usado en el path).
 *   - **OG locale**    → "es_MX", "en_US" (formato Open Graph, con guión bajo).
 *   - **HTML lang**    → "es-MX", "en-US" (mismo formato BCP-47).
 *
 * Mezclar estos formatos rompe SEO. Las conversiones viven aquí.
 */

export const SUPPORTED_LOCALES = ['es-MX', 'en-US'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'es-MX';

/**
 * Locale storage key — versionado por si cambia el formato en el
 * futuro. El prefijo es el del sitio, para que un visitante que ya
 * guardó la preferencia en vieyralabs.com no la pierda.
 */
export const LOCALE_STORAGE_KEY = 'vieyra-labs.locale.v1';

/**
 * Convierte un locale URL a su forma Open Graph (Open Graph usa
 * guión bajo: `es_MX`).
 *
 * El formato Open Graph es el que Facebook/Meta espera y el que ya
 * se usa en `index.html`. Distinguirlos correctamente evita warnings
 * de validadores como Facebook Sharing Debugger.
 */
export function toOgLocale(locale: Locale): string {
  return locale.replace('-', '_');
}

/**
 * Mapa de etiquetas legibles en el idioma nativo del locale.
 * Se usa en el selector de idioma — sin esto caeríamos en "Spanish"
 * / "English" para ambos idiomas, que es semánticamente ambiguo.
 */
export const LOCALE_LABEL: Record<Locale, string> = {
  'es-MX': 'Español',
  'en-US': 'English',
};

export function isSupportedLocale(value: string | undefined | null): value is Locale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/**
 * Devuelve el locale soportado más cercano al `requested`.
 *
 * Reglas de matching (RFC 4647 simplificado):
 *
 *   1. Coincidencia exacta (case-insensitive) → se acepta tal cual.
 *   2. Match por primary language subtag (`es-ES` → `es-MX`,
 *      `en-GB` → `en-US`).
 *   3. Si no hay match, devuelve `undefined` — el caller decide el fallback.
 */
export function matchSupportedLocale(requested: string | undefined | null): Locale | undefined {
  if (!requested) return undefined;
  const normalized = requested.trim();
  if (!normalized) return undefined;

  for (const supported of SUPPORTED_LOCALES) {
    if (normalized.toLowerCase() === supported.toLowerCase()) {
      return supported;
    }
  }

  const lang = normalized.toLowerCase().split(/[-_]/)[0];
  if (lang === 'es') return 'es-MX';
  if (lang === 'en') return 'en-US';
  return undefined;
}

/**
 * Helper para construir un `path` con prefijo de locale.
 *
 *   localePath('es-MX', '/')        → '/es-MX'
 *   localePath('en-US', '/portfolio/x') → '/en-US/portfolio/x'
 *
 * Para el root con el que se construye el URL absoluto en el
 * sitemap, ver `canonicalUrl()` en `@/config`.
 */
export function localePath(locale: Locale, path: string): string {
  const trimmed = path.replace(/^\/+/, '');
  const suffix = trimmed === '' ? '' : `/${trimmed}`;
  return `/${locale}${suffix}`;
}
