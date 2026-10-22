/**
 * Detección del locale activo.
 *
 * Orden de prioridad (definido en §6 de la tarea):
 *
 *   1. Locale explícito en la URL (`/es-MX/...`, `/en-US/...`).
 *   2. Preferencia manual guardada del usuario (`localStorage`),
 *      sólo si es un locale soportado.
 *   3. Lista de preferencias del navegador (`navigator.languages[]`),
 *      considera todas las entradas en orden.
 *   4. Locale default (`es-MX`).
 *
 * El locale URL siempre gana — esto es importante para evitar que
 * el `localStorage` "sobrescriba" silenciosamente la decisión del
 * usuario al pegar un enlace localizado.
 *
 * Esta función está pensada para ser **pura y testeable**: nunca
 * accede a `window` ni a `localStorage`; recibe los valores
 * necesarios como parámetros (`searchedStorage`, `navigatorLanguages`)
 * para poder probarse en entornos sin DOM.
 */

import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  type Locale,
  isSupportedLocale,
  matchSupportedLocale,
} from './locales';

interface DetectOptions {
  /** Primer segmento del path de la URL (sin slash inicial). `undefined` para root. */
  readonly pathPrefix: string | undefined;
  /**
   * `localStorage` lookup previo. `null` indica "no hay valor
   * guardado"; `undefined` indica "no se pudo leer storage
   * (entorno no-DOM o caído)"; string es el valor crudo.
   */
  readonly storedLocale: string | null | undefined;
  /** Resultado de `navigator.languages` (ya normalizado). `[]` si está caído. */
  readonly navigatorLanguages: readonly string[];
}

/**
 * Resuelve el locale que debe estar activo dados los tres inputs.
 *
 * Esta función NO emite efectos secundarios. Quien la llama decide
 * qué hacer con el resultado (normalmente llamar a `i18n.changeLanguage`
 * y hacer `Navigate`).
 */
export function resolveLocale(options: DetectOptions): Locale {
  const { pathPrefix, storedLocale, navigatorLanguages } = options;

  // 1. URL gana.
  if (isSupportedLocale(pathPrefix)) {
    return pathPrefix;
  }

  // 2. Preferencia manual.
  if (typeof storedLocale === 'string' && isSupportedLocale(storedLocale)) {
    return storedLocale;
  }

  // 3. Browser preferences, todas las entradas en orden.
  for (const candidate of navigatorLanguages) {
    const matched = matchSupportedLocale(candidate);
    if (matched) return matched;
  }

  // 4. Default.
  return DEFAULT_LOCALE;
}

/**
 * Acceso al `localStorage` con fallback seguro.
 *
 * Devuelve `undefined` si el storage no está disponible (SSR, modo
 * privado, sandbox sin permisos), `null` si la clave no existe, o
 * el valor crudo.
 */
export function readStoredLocale(storage: Storage | null | undefined): string | null | undefined {
  if (!storage) return undefined;
  try {
    return storage.getItem(LOCALE_STORAGE_KEY);
  } catch {
    return undefined;
  }
}

/** Escribe el locale seleccionado por el usuario en `localStorage`. */
export function writeStoredLocale(storage: Storage | null | undefined, locale: Locale): void {
  if (!storage) return;
  try {
    storage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Fail silently: storage caído no debe romper el cambio de idioma.
  }
}

/** Acceso seguro a `navigator.languages`. Devuelve `[]` si no existe. */
export function readBrowserLanguages(): readonly string[] {
  if (typeof navigator === 'undefined') return [];
  const fromNavigator = navigator.languages;
  if (Array.isArray(fromNavigator) && fromNavigator.length > 0) {
    return fromNavigator;
  }
  if (typeof navigator.language === 'string' && navigator.language.length > 0) {
    return [navigator.language];
  }
  return [];
}

/**
 * Versión "DOM-aware" de `resolveLocale`: lee storage y navigator
 * directamente. Usar sólo desde el bootstrap cliente, nunca en
 * componentes durante el render (puede causar hydration mismatch
 * si en el futuro se añade SSR/SSG).
 */
export function detectInitialLocale(pathname: string): Locale {
  const segment = pathname.replace(/^\/+/, '').split('/')[0];
  return resolveLocale({
    pathPrefix: segment === '' ? undefined : segment,
    storedLocale: readStoredLocale(getStorage()),
    navigatorLanguages: readBrowserLanguages(),
  });
}

function getStorage(): Storage | null | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}
