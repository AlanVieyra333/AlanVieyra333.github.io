/**
 * Configuración general del subsistema i18n.
 *
 * Re-exporta los locales desde `locales.ts` para mantener una única
 * superficie de imports en el resto de la app, y expone la lista
 * "amigable" (recorrible, iterable para hreFlang, sitemap, etc.).
 */

export {
  DEFAULT_LOCALE,
  LOCALE_LABEL,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  isSupportedLocale,
  localePath,
  matchSupportedLocale,
  toOgLocale,
} from './locales';

import type { Locale } from './locales';

/** Etiqueta legible del locale en su propio idioma (no es t()). */
export const LOCALE_IN_NATIVE: Record<Locale, string> = {
  'es-MX': 'Español (México)',
  'en-US': 'English (United States)',
};
