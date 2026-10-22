import { Component, type ErrorInfo, type ReactNode } from 'react';

import ErrorFallback from './ErrorFallback';

interface ErrorBoundaryProps {
  readonly children: ReactNode;
  /** Etiqueta legible para identificar el límite en logs. */
  readonly label?: string;
}

interface ErrorBoundaryState {
  readonly error: Error | null;
}

/**
 * Límite de error de React.
 *
 * Captura errores de render en cualquier descendiente y muestra un
 * fallback accesible en lugar de dejar la pantalla en blanco. Manda
 * el error a la consola para diagnóstico, pero no usa ningún servicio
 * externo (no hay Sentry/Datadog en este sitio).
 *
 * Errores dentro de event handlers NO son capturados (React sólo
 * captura errores de render). Esos siguen propagando a `window.onerror`
 * y al DevTools del browser.
 *
 * Implementación: el class component mantiene el estado (`error` +
 * lifecycle); el render delega en `ErrorFallback` (function component,
 * en archivo aparte) para poder usar `useTranslation()` — los hooks
 * no funcionan dentro de un class component.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // El navegador ya registra el stack; lo etiquetamos para que sea
    // fácil de encontrar si hay un log centralizado en el futuro.
    const label = this.props.label ?? 'root';
    console.error(`[ErrorBoundary:${label}]`, error, info.componentStack);
  }

  private handleReset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    if (error === null) return this.props.children;
    return <ErrorFallback error={error} onReset={this.handleReset} />;
  }
}
