import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollManager from './ScrollManager';
import RouteFallback from './RouteFallback';

/**
 * Layout compartido por todas las rutas dentro de `/:locale/*`.
 *
 * Mantiene el Navbar y Footer montados entre navegaciones y
 * coloca el `<Suspense>` alrededor del `<Outlet>` (no del
 * `<Routes>`) para que sólo el contenido principal cambie al
 * cargar rutas perezosas. El skip-link vive aquí porque es el
 * primer foco de la página tras la `<Navbar>` fija.
 */
export default function Layout() {
  const { t } = useTranslation('common');
  return (
    <>
      <a href="#contenido" className="skip-link">
        {t('skipLink')}
      </a>
      <ScrollManager />
      <Navbar />
      <main
        id="contenido"
        tabIndex={-1}
        className="pt-20 focus:outline-none"
      >
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
