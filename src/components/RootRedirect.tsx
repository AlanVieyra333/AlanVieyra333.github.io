/**
 * `RootRedirect` — punto de entrada para `pathname === '/'`.
 *
 * Resuelve el locale y navega a su URL localizada (eq. `/es-MX/`,
 * `/en-US/`). El `<Navigate replace />` evita contaminar el history
 * con la entrada `/`, así el botón "Atrás" del browser va a la
 * página externa de la que vinieron, no al root.
 *
 * Usa `useLocation()` (react-router) en lugar de `window.location`:
 *
 *   - Mantiene la decisión de routing en el mismo contexto del
 *     router; el browser bar y el router pueden desincronizarse
 *     durante navegación programática, y queremos siempre la
 *     verdad que ve el router.
 *   - Funciona en tests con `MemoryRouter` (que no expone
 *     `window.location`).
 *   - Si en el futuro se añade SSR, sigue funcionando coherente
 *     con el estado de la request, no del browser.
 */

import { Navigate, useLocation } from 'react-router-dom';

import { localePath } from '@/i18n/locales';
import { detectInitialLocale } from '@/i18n/detectLocale';

export default function RootRedirect() {
  const location = useLocation();
  const target = localePath(detectInitialLocale(location.pathname), '/');
  return <Navigate to={target} replace />;
}
