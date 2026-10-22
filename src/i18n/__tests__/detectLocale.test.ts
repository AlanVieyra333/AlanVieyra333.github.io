import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  LOCALE_STORAGE_KEY,
  type Locale,
} from '../locales';
import {
  resolveLocale,
  readStoredLocale,
  writeStoredLocale,
  detectInitialLocale,
} from '../detectLocale';

/**
 * Tests para `resolveLocale` — la decisión determinística de
 * qué locale usar.
 *
 * Estrategia: `resolveLocale` es puro, no toca `window` ni
 * `localStorage`. Cada test pasa explícitamente los inputs que
 * la versión DOM-aware leería.
 */
describe('resolveLocale', () => {
  it('devuelve el locale del URL cuando es válido', () => {
    const result = resolveLocale({
      pathPrefix: 'en-US',
      storedLocale: null,
      navigatorLanguages: ['fr-FR'],
    });
    expect(result).toBe('en-US');
  });

  it('ignora el localStorage cuando el URL trae un locale válido', () => {
    const result = resolveLocale({
      pathPrefix: 'es-MX',
      storedLocale: 'en-US',
      navigatorLanguages: [],
    });
    expect(result).toBe('es-MX');
  });

  it('usa localStorage si el URL no trae locale y la preferencia es válida', () => {
    const result = resolveLocale({
      pathPrefix: undefined,
      storedLocale: 'en-US',
      navigatorLanguages: ['es-MX', 'fr-FR'],
    });
    expect(result).toBe('en-US');
  });

  it('ignora localStorage con valor inválido', () => {
    const result = resolveLocale({
      pathPrefix: undefined,
      storedLocale: 'ru-RU',
      navigatorLanguages: ['es-MX'],
    });
    expect(result).toBe('es-MX');
  });

  it('usa la primera preferencia del navegador soportada', () => {
    const result = resolveLocale({
      pathPrefix: undefined,
      storedLocale: null,
      navigatorLanguages: ['es-MX', 'en-US', 'fr-FR'],
    });
    expect(result).toBe('es-MX');
  });

  it('hace fallback de "es-ES" a "es-MX"', () => {
    const result = resolveLocale({
      pathPrefix: undefined,
      storedLocale: null,
      navigatorLanguages: ['es-ES'],
    });
    expect(result).toBe('es-MX');
  });

  it('hace fallback de "en-GB" a "en-US"', () => {
    const result = resolveLocale({
      pathPrefix: undefined,
      storedLocale: null,
      navigatorLanguages: ['en-GB'],
    });
    expect(result).toBe('en-US');
  });

  it('hace fallback al default cuando ningún idioma es soportado', () => {
    const result = resolveLocale({
      pathPrefix: undefined,
      storedLocale: null,
      navigatorLanguages: ['fr-FR', 'de-DE', 'pt-BR'],
    });
    expect(result).toBe(DEFAULT_LOCALE);
  });

  it('hace fallback al default sin navegador ni storage', () => {
    const result = resolveLocale({
      pathPrefix: undefined,
      storedLocale: null,
      navigatorLanguages: [],
    });
    expect(result).toBe(DEFAULT_LOCALE);
  });

  it('prioridad: URL > localStorage > browser > default', () => {
    const all = (overrides: Partial<Parameters<typeof resolveLocale>[0]>) =>
      resolveLocale({
        pathPrefix: undefined,
        storedLocale: null,
        navigatorLanguages: [],
        ...overrides,
      });

    expect(
      all({ pathPrefix: 'en-US', storedLocale: 'es-MX', navigatorLanguages: [] }),
    ).toBe('en-US');
    expect(
      all({ storedLocale: 'en-US', navigatorLanguages: ['es-MX'] }),
    ).toBe('en-US');
    expect(all({ navigatorLanguages: ['es-MX'] })).toBe('es-MX');
    expect(all({})).toBe(DEFAULT_LOCALE);
  });

  it('rechaza localStorage con value null / undefined sin error', () => {
    expect(
      resolveLocale({
        pathPrefix: undefined,
        storedLocale: null,
        navigatorLanguages: ['fr-FR'],
      }),
    ).toBe(DEFAULT_LOCALE);
    expect(
      resolveLocale({
        pathPrefix: undefined,
        storedLocale: undefined,
        navigatorLanguages: ['en-US'],
      }),
    ).toBe('en-US');
  });

  it('ignora paths URL no soportados y cae al siguiente nivel', () => {
    const result = resolveLocale({
      pathPrefix: 'fr-FR',
      storedLocale: 'en-US',
      navigatorLanguages: ['de-DE'],
    });
    expect(result).toBe('en-US');
  });
});

describe('readStoredLocale / writeStoredLocale', () => {
  it('read devuelve undefined si el storage no existe', () => {
    expect(readStoredLocale(null)).toBeUndefined();
    expect(readStoredLocale(undefined)).toBeUndefined();
  });

  it('read devuelve el valor si existe', () => {
    const fake: Storage = {
      getItem: (k) => (k === LOCALE_STORAGE_KEY ? 'en-US' : null),
      setItem: () => undefined,
      removeItem: () => undefined,
      clear: () => undefined,
      key: () => null,
      length: 1,
    };
    expect(readStoredLocale(fake)).toBe('en-US');
  });

  it('write no falla si el storage es null', () => {
    expect(() => writeStoredLocale(null, 'en-US')).not.toThrow();
  });

  it('write persiste en un storage válido', () => {
    const setItem = vi.fn();
    const fake: Storage = {
      getItem: () => null,
      setItem,
      removeItem: () => undefined,
      clear: () => undefined,
      key: () => null,
      length: 0,
    };
    writeStoredLocale(fake, 'en-US');
    expect(setItem).toHaveBeenCalledWith(LOCALE_STORAGE_KEY, 'en-US');
  });
});

describe('detectInitialLocale (DOM-aware)', () => {
  beforeEach(() => {
    // Resetear el stub de location entre tests.
  });

  afterEach(() => {
    // Restaurar mocks.
    vi.restoreAllMocks();
    // `navigator` y `window` son accessors de solo lectura en el
    // `Window` de jsdom (vitest 5 expone el window real como
    // globalThis), así que sólo se pueden sustituir con
    // `vi.stubGlobal`, que usa `defineProperty`.
    vi.unstubAllGlobals();
  });

  it('lee el prefijo del pathname directamente', () => {
    const fakeStore: Record<string, string> = {};
    const windowMock = {
      localStorage: {
        getItem: (k: string) => fakeStore[k] ?? null,
        setItem: (k: string, v: string) => {
          fakeStore[k] = v;
        },
        removeItem: (k: string) => {
          delete fakeStore[k];
        },
        clear: () => undefined,
        key: () => null,
        length: 0,
      },
    };
    vi.stubGlobal('window', windowMock);
    vi.stubGlobal('navigator', { languages: ['en-US'] });

    expect(detectInitialLocale('/es-MX/portfolio/foo')).toBe('es-MX');
    expect(detectInitialLocale('/en-US/')).toBe('en-US');
    expect(detectInitialLocale('/')).toBe('en-US'); // navigator → en-US
  });

  it('usa localStorage cuando no hay locale en URL', () => {
    const fakeStore: Record<string, string> = {};
    fakeStore[LOCALE_STORAGE_KEY] = 'en-US';
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (k: string) => fakeStore[k] ?? null,
        setItem: (k: string, v: string) => {
          fakeStore[k] = v;
        },
        removeItem: (k: string) => {
          delete fakeStore[k];
        },
        clear: () => undefined,
        key: () => null,
        length: 0,
      },
    });
    vi.stubGlobal('navigator', { languages: ['fr-FR'] });
    expect(detectInitialLocale('/')).toBe('en-US');
  });
});

// Garantía estática: todos los locales soportados son strings
// válidos y no se modifican accidentalmente.
describe('SUPPORTED_LOCALES', () => {
  it('contiene exactamente es-MX y en-US', () => {
    expect(new Set(SUPPORTED_LOCALES)).toEqual(new Set(['es-MX', 'en-US']));
  });

  it('default locale está incluido en soportados', () => {
    expect(SUPPORTED_LOCALES).toContain(DEFAULT_LOCALE);
  });
});

// Garantiza que Locale es exactamente la unión correcta (cubre el
// flag --type-check durante los tests).
function _typeAssertions(): Locale {
  const a: Locale = 'es-MX';
  const b: Locale = 'en-US';
  // Forzamos el branch a evaluar ambos lados sin chocar con
  // `noUnusedLocals`: la comparación se hace contra un literal
  // que puede no ser del tipo exacto.
  return (a === ('en-US' as Locale) ? b : a);
}
void _typeAssertions;
