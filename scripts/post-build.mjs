#!/usr/bin/env node
/**
 * scripts/post-build.mjs
 * ----------------------
 * Prepara `dist/` para GitHub Pages.
 *
 * **Por qué hace falta.** El sitio usa enrutado del lado del cliente
 * con rutas localizadas (`/es-MX/`, `/en-US/`). GitHub Pages es un
 * hosting estático: no reescribe URLs ni tiene reglas de servidor, así
 * que una petición a `/es-MX/` busca un archivo `es-MX/index.html` y,
 * si no existe, devuelve 404. Un recargado de página en la URL
 * localizada se rompería.
 *
 * La solución es que cada locale tenga su propio `index.html`. Como la
 * app se resuelve en el cliente, el HTML es idéntico en todos los
 * casos: el locale correcto lo decide `detectInitialLocale` leyendo
 * `window.location.pathname` en el arranque.
 *
 * **De dónde salen los locales.** De los directorios de
 * `src/i18n/resources/`. Cada directorio es un locale soportado, así
 * que la lista no puede quedar desincronizada con los recursos de
 * i18n: agregar un idioma es crear su directorio, y este script lo
 * recoge solo.
 */

import { cp, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const RESOURCES = join(ROOT, 'src', 'i18n', 'resources');

async function main() {
  if (!existsSync(join(DIST, 'index.html'))) {
    console.error('[post-build] dist/index.html no existe. ¿Se corrió el build?');
    process.exit(1);
  }

  const locales = (await readdir(RESOURCES, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  if (locales.length === 0) {
    console.error('[post-build] No se encontró ningún locale en src/i18n/resources/.');
    process.exit(1);
  }

  for (const locale of locales) {
    const target = join(DIST, locale);
    await mkdir(target, { recursive: true });
    await cp(join(DIST, 'index.html'), join(target, 'index.html'));
  }

  console.log(`[post-build] index.html copiado para: ${locales.join(', ')}`);
}

main().catch((err) => {
  console.error('[post-build] error inesperado:', err);
  process.exit(2);
});
