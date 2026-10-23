import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Fondo del Hero: el ciclo de vida del software en movimiento.
 *
 * El clip es una animación 3D del ciclo (Plan & Design, Code, Build &
 * Test, Deploy, Operate…) sobre una retícula azul. Va detrás del
 * texto y atenuado: es atmósfera, no un diagrama —las etiquetas giran
 * con la cámara y no se leen.
 *
 * Decisiones:
 *
 *  - **Sin audio.** Un video de fondo que suena solo incumple WCAG
 *    1.4.2 y compite con el contenido. El asset además se publica sin
 *    pista de audio: la decisión está en el archivo, no sólo en el
 *    marcado.
 *  - **Se pausa fuera de pantalla.** Un `IntersectionObserver` pausa
 *    el clip cuando el hero sale del viewport, para no decodificar en
 *    segundo plano.
 *  - **Con `prefers-reduced-motion` no se reproduce** y se queda el
 *    fotograma del póster.
 *  - **Póster.** Antes de decodificar el primer fotograma se ve una
 *    imagen fija del clip, para que el hero no parpadee al cargar.
 *  - **Dos tamaños.** El clip entra por `media`, así que un teléfono
 *    descarga la versión de 854×480 (500 KB) en lugar de la de
 *    1600×900 (1.5 MB). Un solo formato: H.264 sirve en todos los
 *    navegadores y pesa menos que el WebM equivalente de este clip.
 *  - **Desenfocada a propósito.** El clip lleva rótulos propios que
 *    giran con la cámara; sin desenfoque compiten con el titular. Con
 *    2.5px el texto se disuelve y quedan el bucle, las partículas y
 *    los objetos, que es lo que da profundidad.
 */
export default function HeroBackdrop() {
  const reduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (reduceMotion) {
      video.pause();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // El autoplay puede estar bloqueado: si lo está, el póster
          // se queda en su sitio y no pasa nada.
          void video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      },
      { threshold: 0 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [reduceMotion]);

  return (
    <video
      ref={videoRef}
      aria-hidden="true"
      className="absolute inset-0 -z-20 h-full w-full scale-[1.04] object-cover opacity-[0.6] blur-[2.5px]"
      autoPlay={!reduceMotion}
      muted
      loop
      playsInline
      preload="metadata"
      poster="/ciclo-de-vida-software-poster.jpg"
      tabIndex={-1}
    >
      <source media="(max-width: 767px)" src="/ciclo-de-vida-software-sm.mp4" type="video/mp4" />
      <source src="/ciclo-de-vida-software.mp4" type="video/mp4" />
    </video>
  );
}
