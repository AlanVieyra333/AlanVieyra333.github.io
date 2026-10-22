import { SITE_NAME } from '@/config';

/**
 * Wordmark de la marca.
 *
 * El nombre se parte en dos por el espacio: la primera palabra lleva el
 * azul del favicon (#2d7ab3) y el resto, el azul más oscuro del sistema
 * de diseño (brand-950). El color más pesado queda al final de la
 * palabra, donde funciona como ancla visual.
 *
 * Contraste sobre el navbar blanco (bg-white, ver Navbar.tsx):
 *   primera palabra #2d7ab3 → 4.62:1 → pasa WCAG AA-normal
 *   resto          #0f2352 → 15.2:1  → pasa todo
 *
 * La tipografía (font-weight 700, tracking apretado) la pone el
 * contenedor padre.
 *
 * ⚠️ #2d7ab3 está hardcodeado porque no es un token del sistema de
 * diseño (brand-500 es #3384f0, un azul distinto). Si se usa en más
 * lugares, conviene promoverlo a un token semántico
 * (p. ej. --color-logo-blue o --color-brand-mark).
 */
export default function Wordmark() {
  const [first, ...rest] = SITE_NAME.split(' ');
  return (
    <>
      <span style={{ color: '#2d7ab3' }}>{first}</span>
      <span className="text-brand-950">{rest.join(' ')}</span>
    </>
  );
}
