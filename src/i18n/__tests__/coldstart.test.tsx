/**
 * Arranque en frío — regresión del bug "URL en /en-US pero la página
 * sale en español".
 *
 * El síntoma era que `i18n.language` llegaba correctamente a `en-US`
 * y el store tenía el bundle inglés, pero el DOM seguía mostrando
 * español: los `useTranslation()` se habían suscrito al
 * `languageChanged` de una instancia de i18next que después quedó
 * reemplazada por el `init()` que disparaba el propio render.
 *
 * Estos tests renderizan el `<App />` real con `StrictMode` (como
 * `main.tsx`) y comprueban el idioma del **primer** render, no sólo
 * el estado final de i18next.
 *
 * Nota sobre el singleton: todos los tests de este archivo comparten
 * la misma instancia de i18next. Por eso `primeLocale()` sincroniza
 * el idioma **antes** de montar React — sin consumidores suscritos,
 * `changeLanguage` es seguro y no reproduce el bug que estamos
 * vigilando. Lo que se prueba aquí es el render, no el singletón.
 *
 * Usa el `window`/`navigator` reales de jsdom con spies: reemplazar
 * `globalThis.window` por un objeto plano rompe react-dom.
 */
import { describe, it, expect, afterEach, beforeAll, vi } from 'vitest';
import { StrictMode } from 'react';
import { render, screen, act, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import App from '../../App';
import { i18n, initI18n } from '@/i18n';
import type { Locale } from '@/i18n';

beforeAll(() => {
  initI18n();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.localStorage.clear();
});

/** Sincroniza el idioma de i18next con el de la URL, sin componentes montados. */
async function primeLocale(locale: Locale): Promise<void> {
  if (i18n.language !== locale) {
    await i18n.changeLanguage(locale);
  }
}

async function renderAt(path: string, locale: Locale): Promise<string> {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['es-MX']);
  await primeLocale(locale);
  await act(async () => {
    render(
      <StrictMode>
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>
      </StrictMode>,
    );
  });
  return screen.getByRole('heading', { level: 1 }).textContent ?? '';
}

describe('arranque en frío: el idioma lo manda la URL', () => {
  it('en /en-US el primer render ya sale en inglés', async () => {
    const h1 = await renderAt('/en-US', 'en-US');
    expect(h1).toMatch(/I configure the infrastructure/i);
  });

  it('en /es-MX el primer render sale en español', async () => {
    const h1 = await renderAt('/es-MX', 'es-MX');
    expect(h1).toMatch(/Configuro la infraestructura/);
  });

  it('la URL manda sobre la preferencia guardada en localStorage', async () => {
    window.localStorage.setItem('vieyra-labs.locale.v1', 'es-MX');
    const h1 = await renderAt('/en-US', 'en-US');
    expect(h1).toMatch(/I configure the infrastructure/i);
  });

  it('el bundle de recursos del locale activo está cargado', async () => {
    await primeLocale('en-US');
    expect(i18n.hasResourceBundle('en-US', 'home')).toBe(true);
    expect(i18n.t('home:hero.title')).toMatch(/I configure the infrastructure/i);
  });
});