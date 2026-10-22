/**
 * Hook para acceder al `LocaleContext`.
 *
 * Lanza un error si se usa fuera del provider — es un error de
 * arquitectura, no algo que deba enmascararse.
 */

import { useContext } from 'react';

import { LocaleContext, type LocaleContextValue } from './localeContext';

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within <LocaleProvider>');
  }
  return ctx;
}
