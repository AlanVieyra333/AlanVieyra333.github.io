/**
 * `LocaleApp` — wrapper para todas las rutas con prefijo de locale.
 *
 * Responsabilidades:
 *
 *   1. Validar que `:locale` (primer segmento del path) es un locale
 *      soportado. Si no lo es, redirige a la versión con locale por
 *      default en lugar de renderizar 404 — los prefijos no
 *      soportados no son "rutas reales", son URLs que no deberían
 *      existir.
 *   2. Calcular el `currentPath` (path sin prefijo de locale) para
 *      que `LocaleProvider.switchLocale()` pueda reconstruir el URL
 *      en el otro idioma.
 *   3. Renderizar `<LocaleProvider>` envolviendo `<Layout>`.
 *
 * El `<Outlet>` de react-router vive dentro de `<Layout>` —
 * `LocaleApp` no necesita renderizarlo aquí, porque `Layout`
 * ya lo hace.
 */

import { useMemo } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';

import { DEFAULT_LOCALE, isSupportedLocale, localePath, type Locale } from '@/i18n/locales';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import Layout from '@/components/Layout';

export default function LocaleApp() {
  const params = useParams<{ locale: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const locale: Locale | undefined = isSupportedLocale(params.locale)
    ? params.locale
    : undefined;

  // Calcula el path SIN el prefijo de locale. Por ejemplo, con
  // `/es-MX/portfolio/foo`, devuelve `/portfolio/foo`. Con
  // `/en-US/`, devuelve `/`.
  const currentPath = useMemo(() => {
    if (!locale) return '/';
    const stripped = location.pathname.replace(/^\/[^/]+/, '');
    return stripped === '' ? '/' : stripped;
  }, [locale, location.pathname]);

  if (!locale) {
    // Locale inválido en la URL. Redirigir a la versión default,
    // evitando caer en `/` (que también redirige) y producir
    // doble navegación. Vamos directo al default.
    return <Navigate to={localePath(DEFAULT_LOCALE, '/')} replace />;
  }

  return (
    <LocaleProvider
      locale={locale}
      navigate={(to) => {
        navigate(to);
      }}
      currentPath={currentPath}
    >
      <Layout />
    </LocaleProvider>
  );
}
