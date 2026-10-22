import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Gestiona el scroll entre navegaciones.
 *
 *  - En cambios de ruta sin hash, salta al inicio instantáneamente.
 *  - En navegaciones con hash, busca el destino y, si aún no montó
 *    (caso de rutas perezosas), reintenta tras un tick.
 *  - `location.key` en las dependencias hace que un clic repetido en
 *    el mismo enlace con hash vuelva a scrollear.
 *  - Mueve el foco al `<main>` para que lectores de pantalla
 *    anuncien el cambio de ruta.
 */
export default function ScrollManager() {
  const location = useLocation();

  useEffect(() => {
    const focusMain = () => {
      const main = document.getElementById('contenido');
      if (main) {
        main.focus({ preventScroll: true });
      }
    };

    if (location.hash) {
      const id = decodeURIComponent(location.hash.slice(1));
      const scrollToTarget = () => {
        const target = document.getElementById(id);
        if (target) {
          target.scrollIntoView();
        }
      };
      scrollToTarget();
      // Reintenta tras un tick: la ruta puede haber cambiado a un chunk
      // perezoso que aún no montó el destino.
      const timeout = window.setTimeout(scrollToTarget, 200);
      return () => window.clearTimeout(timeout);
    }

    // El options form de scrollTo acepta `behavior`, evitando el patrón
    // racy de mutar y restaurar `scroll-behavior` en el root.
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    focusMain();
  }, [location.pathname, location.hash, location.key]);

  return null;
}
