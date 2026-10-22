# Portafolio — Alan Fernando Rincón Vieyra

Sitio público del portafolio profesional, publicado en
**[alanvieyra333.github.io](https://alanvieyra333.github.io)**.

Bilingüe (es-MX / en-US), sin backend y sin servicios de terceros. El
contenido vive en un solo sitio —los recursos de i18n— y está sujeto a
la **misma frontera editorial** que los ocho perfiles del currículum.

## Stack

- **Framework:** React 19 + Vite 8
- **Lenguaje:** TypeScript (strict, `verbatimModuleSyntax`, `erasableSyntaxOnly`)
- **Estilos:** Tailwind CSS v4 (CSS-first, `@theme` en `src/index.css`)
- **Animación:** framer-motion (con `useReducedMotion`)
- **Iconos:** react-icons
- **Routing:** react-router-dom v7 (`BrowserRouter` con `Suspense`)
- **i18n:** i18next + react-i18next (es-MX default, en-US)
- **Tests:** vitest + @testing-library/react + jsdom
- **Hosting:** GitHub Pages (workflow en `.github/workflows/deploy-pages.yml`)

No usamos CSS Modules ni styled-components. Toda la estilización es
Tailwind v4 con tokens definidos directamente en CSS.

## Scripts

| Script | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo en `http://localhost:5173`. |
| `npm run build` | Compila TypeScript, construye el bundle y genera los entry points localizados. |
| `npm run preview` | Sirve el build de producción localmente. |
| `npm run lint` | Corre ESLint sobre el proyecto. |
| `npm run test` | Lanza vitest en modo watch. |
| `npm run test:run` | Lanza vitest una sola vez (CI). |
| `npm run typecheck` | Verifica los tipos con `tsc -b`. |
| `npm run i18n:check` | Valida paridad de claves e interpolaciones entre es-MX y en-US. |
| `npm run editorial:check` | Valida la frontera editorial del contenido contra `FACTS.md` §4. |

## Estructura

```
src/
├── App.tsx                # árbol de rutas anidadas
├── main.tsx               # bootstrap (StrictMode + MotionConfig + BrowserRouter)
├── config.ts              # identidad, contacto, redes sociales, guard de despliegue
├── index.css              # @theme tokens + base layer (focus, reduced-motion, skip-link)
├── components/            # Navbar, Footer, Hero, Profile, Experience, Stack, Projects, ...
├── content/profile.ts     # identificadores y enlaces (nunca prosa)
├── i18n/                  # subsistema i18n (config, recursos, contexto, selector)
│   ├── locales.ts         # tipo Locale + helpers (localePath, toOgLocale, ...)
│   ├── index.ts           # initI18n() singleton
│   ├── LocaleProvider.tsx # provider React (idioma activo, switchLocale, html lang)
│   ├── LanguageSelector.tsx
│   └── resources/
│       ├── es-MX/         # JSON por namespace (common, home, profile, experience, ...)
│       └── en-US/
├── pages/                 # Home, NotFound
└── scripts/               # scripts Node de mantenimiento
```

## Internacionalización (i18n)

El sitio soporta dos locales: **es-MX** (default) y **en-US**. Las URLs
siempre llevan el prefijo de locale:

- `/es-MX/`
- `/en-US/`

La raíz `/` redirige client-side al locale detectado según esta
prioridad:

1. **Prefijo de URL** (si está presente y soportado).
2. **`localStorage`** (`vieyra-labs.locale`, persistido al cambiar
   idioma).
3. **`navigator.languages`** (con fallback regional `es-ES → es-MX`,
   `en-GB → en-US`).
4. **Default** (`es-MX`).

### Recursos

Las traducciones viven en `src/i18n/resources/<locale>/*.json` (un
archivo por namespace: `common`, `home`, `profile`, `experience`,
`stack`, `projects`, `credentials`, `contact`, `notFound`, `meta`).

`npm run i18n:check` valida:

- Cada archivo es JSON válido.
- Las claves de `es-MX` existen todas en `en-US`.
- Las interpolaciones `{{var}}` están balanceadas entre locales.

CI corre este script antes del build. Si añadís un locale nuevo,
registrarlo en `SUPPORTED_LOCALES` (`src/i18n/locales.ts`) y crear su
carpeta espejo en `src/i18n/resources/`.

### Dónde vive el contenido

- **La prosa va en los JSON de i18n**, no en los componentes. Así la
  paridad es-MX / en-US es verificable por máquina.
- **`src/content/profile.ts` sólo tiene identificadores y enlaces.**
  Los identificadores son estables entre idiomas: la sección
  `veradat` es `veradat` en español y en inglés.

### SEO internacional

`PageMeta` emite por página:

- `<link rel="canonical">` con la URL del locale activo.
- `<link rel="alternate" hreflang="es-MX" hreflang="en-US">` para
  que Google sirva la versión correcta.
- `og:locale` y `og:locale:alternate` (formato Open Graph:
  `es_MX` / `en_US`).
- `<html lang>` se sincroniza vía `LocaleProvider` en cada cambio
  de idioma.
- JSON-LD de tipo `Person`.

El `public/sitemap.xml` declara `xhtml:link` con `hreflang` para
las dos versiones de cada URL pública.

## Frontera editorial

El sitio es una superficie pública: hereda la misma frontera que los
perfiles del currículum, definida en `FACTS.md` §4 del repositorio
`resume`. `npm run editorial:check` la aplica mecánicamente al texto
y falla si el contenido:

- afirma trabajo de ML (entrenamiento, fine-tuning, RAG, embeddings,
  bases vectoriales, MLOps, APIs de LLM),
- declara SLO, error budgets, postmortems o RCA,
- habla de guardia 24/7,
- dice que implementó la arquitectura hexagonal (la revisó),
- nombra los proyectos móviles.

Las URL quedan fuera del chequeo a propósito: el enlace al repositorio
público sí lleva el nombre, por decisión editorial explícita.

## GitHub Pages y el enrutado del cliente

GitHub Pages es un hosting estático: no reescribe URLs. Como el sitio
usa enrutado del lado del cliente con rutas localizadas, hace falta un
`index.html` por locale — si no, un recargado en `/es-MX/` daría 404.

`scripts/post-build.mjs` los genera después del build, leyendo la
lista de locales de los directorios de `src/i18n/resources/`: agregar
un idioma es crear su directorio, y el script lo recoge solo. CI
verifica que los entry points existen.

## Antes de desplegar

1. **Configurar los datos de contacto** en `src/config.ts`
   (`CONTACT.email`, `CONTACT.whatsappNumber`) y `src/socials.ts`.
2. **Confirmar el dominio canónico** en `SITE_URL` y `OG_IMAGE`.
3. **Correr las validaciones**: `npm run lint && npm run typecheck &&
   npm run test:run && npm run i18n:check && npm run editorial:check &&
   npm run build` — todas en verde antes de mergear a `main`.

## Licencia

MIT. Ver [LICENSE](LICENSE).
