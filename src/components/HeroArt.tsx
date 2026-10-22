/**
 * Arte de fondo del Hero.
 *
 * SVG inline (~1.5 KB) en lugar de la foto anterior (1.36 MB). Dibuja una
 * rejilla sutil y dos glows radiales de marca; el gradiente del Hero se
 * encarga de atenuarlo.
 */
export default function HeroArt() {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 -z-10 h-full w-full text-brand-700"
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
    >
      <defs>
        <pattern id="hero-grid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path
            d="M 48 0 L 0 0 0 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeOpacity="0.18"
          />
        </pattern>
        <radialGradient id="hero-glow-1" cx="0.15" cy="0.25" r="0.55">
          <stop offset="0%" stopColor="var(--color-accent-500)" stopOpacity="0.30" />
          <stop offset="100%" stopColor="var(--color-accent-500)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hero-glow-2" cx="0.85" cy="0.85" r="0.6">
          <stop offset="0%" stopColor="var(--color-brand-700)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="var(--color-brand-700)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="600" fill="url(#hero-grid)" />
      <rect width="800" height="600" fill="url(#hero-glow-1)" />
      <rect width="800" height="600" fill="url(#hero-glow-2)" />
    </svg>
  );
}
