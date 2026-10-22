/**
 * Inicialización del subsistema i18n (singleton).
 *
 * Por qué un módulo singleton y no un componente React: i18next
 * mantiene un estado global (idioma actual, recursos cargados,
 * listeners). Llamar `i18n.init()` dos veces tira advertencias y
 * duplica listeners. Importar `i18n` desde varios módulos es
 * seguro y barato precisamente porque es singleton.
 *
 * Estrategia de carga: **sincrónica** con `resources` estáticos.
 * El bundle total pesa ~15 KB JSON entre los dos locales — bajo
 * el umbral en que lazy loading se justifica para una landing
 * page. Si en el futuro se añaden más idiomas o crecen los
 * recursos, basta con moverlos a un backend (i18next-fs-backend
 * o similar) sin tocar los consumidores.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from './locales';

import commonEs from './resources/es-MX/common.json';
import homeEs from './resources/es-MX/home.json';
import profileEs from './resources/es-MX/profile.json';
import experienceEs from './resources/es-MX/experience.json';
import stackEs from './resources/es-MX/stack.json';
import projectsEs from './resources/es-MX/projects.json';
import credentialsEs from './resources/es-MX/credentials.json';
import contactEs from './resources/es-MX/contact.json';
import notFoundEs from './resources/es-MX/notFound.json';
import metaEs from './resources/es-MX/meta.json';

import commonEn from './resources/en-US/common.json';
import homeEn from './resources/en-US/home.json';
import profileEn from './resources/en-US/profile.json';
import experienceEn from './resources/en-US/experience.json';
import stackEn from './resources/en-US/stack.json';
import projectsEn from './resources/en-US/projects.json';
import credentialsEn from './resources/en-US/credentials.json';
import contactEn from './resources/en-US/contact.json';
import notFoundEn from './resources/en-US/notFound.json';
import metaEn from './resources/en-US/meta.json';

/**
 * Helper sólo para TypeScript: garantiza que un objeto tiene claves
 * de un set específico. Misma forma que `Record` pero verifica en
 * compile-time si las claves literales usadas en el JSON matchean.
 */
function typed<Keys extends string>(value: object): Record<Keys, object> {
  return value as Record<Keys, object>;
}

/**
 * Referencia a la promesa de inicialización en vuelo.
 *
 * Existe para que `initI18n()` sea idempotente **también** mientras
 * la inicialización está en curso. `i18n.isInitialized` sólo pasa a
 * `true` cuando i18next termina de cargar; si dos consumidores
 * llaman a `initI18n()` en el mismo tick (React 19 en StrictMode
 * invoca dos veces los inicializadores de `useState`), sin este
 * guard ambos entrarían y llamarían `i18n.init()` dos veces. La
 * segunda llamada reinicia el `store` y desconecta a los
 * suscriptores de `languageChanged`, dejando la UI pegada en el
 * idioma anterior.
 */
let initPromise: Promise<unknown> | null = null;

/**
 * Inicializa i18next como singleton.
 *
 * Idempotente: llamarla varias veces es seguro y no-op después de
 * la primera. Pasa `locale` para arrancar **directamente** en el
 * idioma correcto en vez de inicializar en `es-MX` y cambiar
 * después — así el primer paint de `/en-US` ya sale en inglés y
 * ningún componente depende de un `changeLanguage` post-mount para
 * actualizarse.
 */
export function initI18n(locale: Locale = DEFAULT_LOCALE): typeof i18n {
  if (i18n.isInitialized) return i18n;
  // Init en vuelo: no volver a llamar a `init()`.
  if (initPromise) return i18n;

  initPromise = i18n
    .use(initReactI18next)
    .init({
      lng: locale,
      fallbackLng: DEFAULT_LOCALE,
      supportedLngs: [...SUPPORTED_LOCALES],
      nonExplicitSupportedLngs: false,
      load: 'currentOnly',
      // Los recursos son estáticos y sin backend, así que la carga
      // puede —y debe— ser sincrónica. Con `initAsync: true`
      // (default) i18next difiere el `load()` a un `setTimeout`, y
      // durante esa ventana los consumidores ya se suscribieron al
      // idioma viejo.
      //
      // Nota: hasta v23 esto se llamaba `initImmediate`; i18next v24
      // lo renombró a `initAsync` y v26 eliminó el alias, así que
      // `initImmediate: false` ya no compila.
      initAsync: false,
      // No necesitamos `ns` por separado: usamos un namespace por
      // sección del sitio (common, home, services, ...) y los
      // exponemos todos como default.
      defaultNS: 'common',
      ns: [
        'common',
        'home',
        'profile',
        'experience',
        'stack',
        'projects',
        'credentials',
        'contact',
        'notFound',
        'meta',
      ],
      resources: {
        'es-MX': {
          common: typed(commonEs),
          home: typed(homeEs),
          profile: typed(profileEs),
          experience: typed(experienceEs),
          stack: typed(stackEs),
          projects: typed(projectsEs),
          credentials: typed(credentialsEs),
          contact: typed(contactEs),
          notFound: typed(notFoundEs),
          meta: typed(metaEs),
        },
        'en-US': {
          common: typed(commonEn),
          home: typed(homeEn),
          profile: typed(profileEn),
          experience: typed(experienceEn),
          stack: typed(stackEn),
          projects: typed(projectsEn),
          credentials: typed(credentialsEn),
          contact: typed(contactEn),
          notFound: typed(notFoundEn),
          meta: typed(metaEn),
        },
      },
      interpolation: {
        // React ya escapa por defecto; no escapar de nuevo en i18next.
        escapeValue: false,
      },
      returnNull: false,
      // saveMissing sólo útil con backend; aquí todos los recursos
      // están sincronizados.
      saveMissing: false,
      react: {
        // No usar Suspense global: los recursos ya están en memoria
        // y eso evita re-renders extra.
        useSuspense: false,
      },
    });

  return i18n;
}

/** Promesa de inicialización; útil en tests y para esperar antes de renderizar. */
export function whenI18nReady(): Promise<unknown> {
  if (i18n.isInitialized) return Promise.resolve(i18n);
  initI18n();
  return initPromise ?? Promise.resolve(i18n);
}

export { i18n };
export { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './locales';
export type { Locale } from './locales';
