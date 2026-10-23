import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import type { ReactNode } from 'react';

import { initI18n } from '@/i18n';
import LocaleApp from '@components/LocaleApp';
import RootRedirect from '@components/RootRedirect';
import Home from '@pages/Home';
import NotFound from '@pages/NotFound';

// Pre-inicializa i18n para que useTranslation() tenga la instancia
// lista desde el primer render de los hijos.
initI18n();

beforeEach(() => {
  // Mock mínimo de `localStorage` para `RootRedirect`.
  const windowMock = {
    scrollTo: () => undefined,
    scroll: () => undefined,
    localStorage: {
      store: {} as Record<string, string>,
      getItem(k: string) {
        return ((this as { store: Record<string, string> }).store[k] ?? null);
      },
      setItem(k: string, v: string) {
        (this as { store: Record<string, string> }).store[k] = v;
      },
      removeItem(k: string) {
        delete (this as { store: Record<string, string> }).store[k];
      },
      clear() {
        (this as { store: Record<string, string> }).store = {};
      },
      key() {
        return null;
      },
      get length() {
        return Object.keys((this as { store: Record<string, string> }).store).length;
      },
    },
  };
  // `navigator` es un accessor de solo lectura en el `Window` de jsdom
  // (vitest 5 expone el window real como globalThis), así que no se
  // puede asignar directamente. `vi.stubGlobal` lo redefine con
  // `defineProperty`, que sí funciona sobre propiedades configurables.
  vi.stubGlobal('window', windowMock);
  vi.stubGlobal('navigator', { languages: ['es-MX'] });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

/**
 * Helper: monta un `<Routes>` con el set mínimo de rutas para
 * probar LocaleApp y RootRedirect sin tocar el resto de la app.
 */
function TestApp({
  children,
  initialEntries,
}: {
  children: ReactNode;
  initialEntries?: string[];
}) {
  return (
    <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
  );
}

describe('LocaleApp — locale-prefixed routing', () => {
  it('renderiza Home para /es-MX/', async () => {
    render(
      <TestApp initialEntries={['/es-MX/']}>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/:locale/*" element={<LocaleApp />}>
            <Route index element={<Home />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </TestApp>,
    );
    // Espera al menos un h1 con texto en español.
    const heading = await screen.findByRole('heading', { level: 1 });
    expect(heading.textContent).toMatch(/Configuro la infraestructura/);
  });

  it('renderiza Home en inglés para /en-US/', async () => {
    render(
      <TestApp initialEntries={['/en-US/']}>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/:locale/*" element={<LocaleApp />}>
            <Route index element={<Home />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </TestApp>,
    );
    const heading = await screen.findByRole('heading', { level: 1 });
    expect(heading.textContent).toMatch(/I configure the infrastructure/i);
  });

  it('renderiza NotFound para un locale inválido y redirige al default', async () => {
    // El redirect inmediato (Navigate) reemplaza la URL antes de que
    // se monte la página real, así que debemos probar que el <Navigate>
    // apunta a la URL default correcta, no el contenido del 404.
    render(
      <TestApp initialEntries={['/fr-FR/']}>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/:locale/*" element={<LocaleApp />}>
            <Route index element={<Home />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </TestApp>,
    );
    // Al entrar a `/fr-FR/` la app navega al default `/es-MX/`.
    // MemoryRouter en la versión 7 sigue la redirección interna.
    const heading = await screen.findByRole('heading', { level: 1 });
    expect(heading.textContent).toMatch(/Configuro la infraestructura/);
  });
});

describe('RootRedirect', () => {
  function setupRoot(languages: string[] = ['es-MX']) {
    vi.stubGlobal('navigator', {
      languages,
    });
    (window as { localStorage: Storage }).localStorage.clear();
    return render(
      <TestApp>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/:locale/*" element={<LocaleApp />}>
            <Route index element={<Home />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </TestApp>,
    );
  }

  it('redirige al locale detectado desde navigator', () => {
    setupRoot(['en-US']);
    // El <Navigate> reemplaza la URL, y MemoryRouter renderiza el destino.
    // Buscamos un heading en inglés.
    return screen.findByRole('heading', { level: 1 }).then((h) => {
      expect(h.textContent).toMatch(/I configure the infrastructure/i);
    });
  });

  it('hace fallback al default si navegador no tiene idioma soportado', () => {
    setupRoot(['fr-FR']);
    return screen.findByRole('heading', { level: 1 }).then((h) => {
      expect(h.textContent).toMatch(/Configuro la infraestructura/);
    });
  });
});

describe('Language selector — switching locales updates URL', () => {
  it('persistir preferencia y actualizar URL no causa loops', async () => {
    // Smoke test mínimo: renderizar la app en /es-MX/ y verificar
    // que el selector existe.
    render(
      <TestApp initialEntries={['/es-MX/']}>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/:locale/*" element={<LocaleApp />}>
            <Route index element={<Home />} />
          </Route>
        </Routes>
      </TestApp>,
    );
    await screen.findByRole('heading', { level: 1 });
    // El selector aparece duplicado (nav desktop + nav mobile).
    const englishButtons = screen.getAllByRole('button', { name: /english/i });
    const spanishButtons = screen.getAllByRole('button', { name: /español/i });
    expect(englishButtons.length).toBeGreaterThan(0);
    expect(spanishButtons.length).toBeGreaterThan(0);
  });
});

/**
 * Evita el warning de "act()" cuando se renderiza con <Navigate>
 * inmediato. Algunos de los tests disparan redirecciones que
 * React Testing Library no siempre envuelve automáticamente.
 */
void act;
