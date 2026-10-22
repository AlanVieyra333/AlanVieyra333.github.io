/**
 * `LocaleContext` — tipo e instancia del contexto que comparte el
 * `LocaleProvider` con el resto de la app.
 *
 * Vive en un archivo aparte del provider porque ESLint
 * (`react-refresh/only-export-components`) rechaza archivos que
 * exportan un componente **y** un valor (el contexto) en el mismo
 * lugar. Separarlos permite fast-refresh sobre el provider sin
 * que el cambio de contexto recompile toda la app.
 */

import { createContext } from 'react';

import type { Locale } from './locales';

export interface LocaleContextValue {
  /** Locale activo. Garantizado soportado. */
  readonly locale: Locale;
  /**
   * Cambia el idioma, persiste la preferencia y navega a la versión
   * equivalente del path actual bajo el nuevo prefijo.
   *
   * Si el path actual ya tiene el prefijo del nuevo locale, se
   * mantiene. Si no, se reemplaza el prefijo. Si no había prefijo,
   * se antepone.
   */
  readonly switchLocale: (next: Locale) => void;
  /**
   * Helper para construir un path localizado. Útil en Link/Hero
   * para mantener consistencia con el locale activo.
   */
  readonly localizedPath: (path: string) => string;
  /**
   * Indica si i18next ya terminó de inicializar. Los consumidores
   * pueden usarlo para mostrar skeletons consistentes con i18n.
   */
  readonly ready: boolean;
}

export const LocaleContext = createContext<LocaleContextValue | null>(null);
