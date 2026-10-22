/**
 * `LanguageSelector` — UI reusable para cambiar entre locales.
 *
 * Decisiones de a11y (verificadas manualmente):
 *
 *   - Renderiza una `<nav aria-labelledby="lang-selector-label">`
 *     con un título visualmente oculto (`sr-only`).
 *   - Cada opción es un `<button type="button">` con `aria-current`
 *     cuando está activo. Usamos botones en vez de links para que
 *     el cambio se perciba como una acción y para evitar confusiones
 *     con `<a href>` que también cambia el path.
 *   - El texto es el nombre nativo del idioma ("Español", "English"),
 *     **no** banderas. Las banderas no son identificadores fiables
 *     (mismo idioma → múltiples banderas) y la tarea lo prohíbe.
 *
 * Variantes:
 *
 *   - `variant="compact"`  → para desktop, sin bg ni border.
 *   - `variant="menu"`     → para el menú móvil, fondo blanco y
 *     ancho completo.
 */

import { useTranslation } from 'react-i18next';
import { SUPPORTED_LOCALES, LOCALE_LABEL } from './locales';
import { useLocale } from './useLocale';

interface Props {
  readonly variant?: 'compact' | 'menu';
  /** Cuando es true, el contenedor es `<ul>` con items como `<li>`. */
  readonly asList?: boolean;
}

export default function LanguageSelector({ variant = 'compact', asList = true }: Props) {
  const { locale, switchLocale } = useLocale();
  const { t } = useTranslation('common');

  const items = SUPPORTED_LOCALES.map((target) => ({
    locale: target,
    label: LOCALE_LABEL[target],
    isActive: target === locale,
  }));

  const containerClass =
    variant === 'menu'
      ? 'flex w-full items-stretch overflow-hidden rounded-card border border-ink-100'
      : 'inline-flex items-center gap-1 rounded-pill border border-ink-100 bg-white/70 p-1 text-eyebrow';

  const buttonClass = (active: boolean) =>
    variant === 'menu'
      ? `flex-1 px-3 py-2 text-center text-small font-medium transition-colors duration-200 ease-out-quint ${
          active
            ? 'bg-brand-700 text-white'
            : 'text-ink-700 hover:bg-ink-50'
        }`
      : `inline-flex items-center justify-center rounded-pill px-3 py-1.5 transition-colors duration-200 ease-out-quint ${
          active
            ? 'bg-brand-700 text-white'
            : 'text-ink-600 hover:bg-ink-100'
        }`;

  const labelId = 'lang-selector-label';

  const render = asList ? (
    <ul className={containerClass}>
      {items.map((item) => (
        <li key={item.locale} className={variant === 'menu' ? 'flex-1' : ''}>
          <button
            type="button"
            onClick={() => switchLocale(item.locale)}
            aria-current={item.isActive ? 'true' : undefined}
            lang={item.locale}
            className={buttonClass(item.isActive)}
          >
            {item.label}
          </button>
        </li>
      ))}
    </ul>
  ) : (
    <div className={containerClass} role="group" aria-labelledby={labelId}>
      {items.map((item) => (
        <button
          key={item.locale}
          type="button"
          onClick={() => switchLocale(item.locale)}
          aria-current={item.isActive ? 'true' : undefined}
          lang={item.locale}
          className={buttonClass(item.isActive)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );

  return (
    <nav aria-labelledby={labelId} className="contents">
      <span id={labelId} className="sr-only">
        {t('language.selectorLabel')}
      </span>
      {render}
    </nav>
  );
}
