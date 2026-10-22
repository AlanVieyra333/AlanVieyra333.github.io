import { useTranslation } from 'react-i18next';

/**
 * Spinner accesible mientras carga una ruta perezosa.
 *
 * El texto "Cargando…" se traduce; el spinner en sí no tiene
 * contenido traducible (es decorativo, marcado con `aria-hidden`).
 * El `<span class="sr-only">` es lo que anuncia el screen reader.
 */
export default function RouteFallback() {
  const { t } = useTranslation('common');
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-live="polite">
      <span className="sr-only">{t('routeFallback.loading')}</span>
      <div
        aria-hidden
        className="h-10 w-10 animate-spin rounded-full border-2 border-brand-200 border-t-brand-700"
      />
    </div>
  );
}
