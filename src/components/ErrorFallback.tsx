/**
 * `ErrorFallback` — UI accesible que se muestra cuando un
 * `ErrorBoundary` captura un error de render.
 *
 * Vive en un archivo aparte del class component porque ESLint
 * (`react-refresh/only-export-components`) requiere que cada
 * archivo exponga un único componente React para que el
 * fast-refresh funcione sin recompilar todo el árbol.
 *
 * Como este componente usa `useTranslation()` (hook que no puede
 * vivir dentro de un class component), lo separamos para
 * mantener limpio el límite de error.
 */

import { useTranslation } from 'react-i18next';

interface ErrorFallbackProps {
  readonly error: Error;
  readonly onReset: () => void;
}

export default function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  const { t } = useTranslation('common');
  return (
    <main
      role="alert"
      aria-live="assertive"
      className="mx-auto flex min-h-svh max-w-2xl flex-col items-center justify-center px-gutter py-section text-center"
    >
      <p className="text-eyebrow uppercase text-accent-300">{t('errorBoundary.eyebrow')}</p>
      <h1 className="mt-5 text-display text-brand-900">
        {t('errorBoundary.title')}
      </h1>
      <p className="mt-6 max-w-prose text-lede text-brand-800">
        {t('errorBoundary.description')}
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center rounded-card bg-accent-500 px-6 py-3 text-body font-semibold text-brand-950 transition-colors duration-200 ease-out-quint hover:bg-accent-300"
        >
          {t('errorBoundary.retry')}
        </button>
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-card border border-brand-200/40 px-6 py-3 text-body font-semibold text-brand-900 transition-colors duration-200 ease-out-quint hover:border-brand-900 hover:bg-brand-900/5"
        >
          {t('errorBoundary.home')}
        </a>
      </div>
      {import.meta.env.DEV ? (
        <pre className="mt-10 max-w-full overflow-auto whitespace-pre-wrap rounded-card border border-brand-200/30 bg-brand-50 p-4 text-left text-caption text-brand-800">
          {error.message}
        </pre>
      ) : null}
    </main>
  );
}
