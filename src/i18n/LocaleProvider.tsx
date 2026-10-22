/**
 * `LocaleProvider` — fuente de verdad para el locale activo en
 * toda la app.
 *
 * Por qué un provider además de `i18next` global:
 *
 *   - `i18next` sabe qué idioma está activo, pero los componentes
 *     también necesitan el locale como **valor estructural**, para
 *     construir URLs, generar canonical/hreFlang y decidir si el
 *     prefijo de la URL actual es válido.
 *   - El provider garantiza que ambos lados (idioma i18next y
 *     locale React) cambian al mismo tiempo mediante un único
 *     `switchLocale()`.
 *
 * Renderiza children sólo cuando i18n ya está listo, para que
 * ningún componente intente `t()` antes de la inicialización.
 */

import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';

import {
  SUPPORTED_LOCALES,
  localePath,
  type Locale,
} from './locales';
import { initI18n, i18n } from './index';
import { writeStoredLocale } from './detectLocale';
import { LocaleContext, type LocaleContextValue } from './localeContext';

interface ProviderProps {
  readonly locale: Locale;
  /** Función para navegar — se inyecta para mantener el provider desacoplado de react-router. */
  readonly navigate: (to: string) => void;
  /** Pathname actual (sin locale ya extraído). */
  readonly currentPath: string;
  readonly children: ReactNode;
}

export function LocaleProvider({ locale, navigate, currentPath, children }: ProviderProps) {
  // i18n se inicializa en el bootstrap (`main.tsx`), antes del
  // primer render y con el locale ya resuelto desde la URL. Este
  // provider ya no lo inicializa: hacerlo aquí implicaría llamar a
  // `i18n.init()` durante la fase de render, que en StrictMode se
  // ejecuta dos veces y deja la UI pegada en el idioma anterior.
  //
  // El fallback es para consumidores que montan `<LocaleProvider>`
  // sin pasar por `main.tsx` (tests, HMR, storybook).
  const ready = useMemo(() => {
    if (!i18n.isInitialized) initI18n(locale);
    return i18n.isInitialized;
  }, [locale]);

  // Mantener una referencia estable a navigate/currentPath para que
  // `switchLocale` no cambie de identidad en cada render. La
  // actualización del `.current` se hace en un `useEffect` (no
  // durante render) para cumplir con la regla `react-hooks/refs`.
  const navigateRef = useRef(navigate);
  const pathRef = useRef(currentPath);
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);
  useEffect(() => {
    pathRef.current = currentPath;
  }, [currentPath]);

  // Mantiene `i18n` en sync con el locale del provider cuando cambia
  // externamente (p. ej. navegación por el history o edición de la
  // URL). En el arranque normal no hace falta —i18n ya nació en el
  // idioma correcto— pero cubre back/forward y entradas directas a
  // una URL distinta dentro de la misma sesión.
  useEffect(() => {
    if (i18n.language !== locale) {
      void i18n.changeLanguage(locale);
    }
  }, [locale]);

  // Sincroniza `<html lang>` para accesibilidad y screen readers.
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const switchLocale = useCallback((next: Locale) => {
    if (!SUPPORTED_LOCALES.includes(next)) return;
    const target = rewritePathWithLocale(pathRef.current, next);
    writeStoredLocale(
      typeof window !== 'undefined' ? window.localStorage : null,
      next,
    );
    void i18n.changeLanguage(next);
    navigateRef.current(target);
  }, []);

  const localizedPath = useCallback(
    (path: string) => localePath(locale, path),
    [locale],
  );

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, switchLocale, localizedPath, ready }),
    [locale, switchLocale, localizedPath, ready],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/**
 * Reemplaza (o antepone) el prefijo de locale en un path.
 *
 *   rewritePathWithLocale('/es-MX/services', 'en-US') → '/en-US/services'
 *   rewritePathWithLocale('/services', 'en-US')        → '/en-US/services'
 *   rewritePathWithLocale('/', 'en-US')                → '/en-US'
 *
 * `current` es el path SIN el locale del provider — siempre se
 * trabaja con el "interior" del prefijo.
 */
function rewritePathWithLocale(current: string, next: Locale): string {
  const trimmed = current.replace(/^\/+/, '');
  return localePath(next, trimmed);
}
