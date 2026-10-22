#!/usr/bin/env node
/**
 * scripts/check-i18n.mjs
 * ------------------------
 * Validador de paridad de traducciones.
 *
 * Tres chequeos:
 *
 *   1. **JSON válido**: cada archivo `*.json` en
 *      `src/i18n/resources/<locale>/` parsea sin errores.
 *
 *   2. **Paridad de claves**: para cada namespace presente en
 *      `es-MX` (idioma de referencia), todas sus claves existen en
 *      `en-US`. Detecta claves faltantes y claves huérfanas.
 *      No exige paridad 1:1 — sólo que `en-US` cubra todo lo de
 *      `es-MX` (la tarea §4 sólo obliga a "ambos soportados");
 *      `es-MX` puede tener claves extra que aún no se traducen.
 *
 *   3. **Interpolaciones balanceadas**: para una misma clave en
 *      ambos locales, el set de placeholders `{{var}}` debe ser
 *      idéntico. Detecta diferencias que causarían strings con
 *      `{{var}}` literal en el idioma destino.
 *
 * Salida:
 *
 *   - Sale con código 0 si todo pasa.
 *   - Sale con código 1 si hay errores (imprime detalles).
 *
 * Uso:
 *   node scripts/check-i18n.mjs
 */

import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const RESOURCES_DIR = join(ROOT, 'src', 'i18n', 'resources');

const REFERENCE_LOCALE = 'es-MX';
const CHECKED_LOCALE = 'en-US';

const errors = [];
const warnings = [];

function pad(s, n) {
  return s + ' '.repeat(Math.max(0, n - s.length));
}

function listKeys(obj, prefix = '') {
  const keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...listKeys(v, path));
    } else {
      keys.push(path);
    }
  }
  return keys;
}

/** Extrae todos los placeholders `{{var}}` de un string. */
function extractInterpolations(value) {
  const set = new Set();
  const strs = Array.isArray(value) ? value : [value];
  for (const item of strs) {
    if (typeof item !== 'string') continue;
    const re = /\{\{\s*([^{}\s]+)\s*\}\}/g;
    let match;
    while ((match = re.exec(item)) !== null) {
      set.add(match[1]);
    }
  }
  return set;
}

async function loadLocale(locale) {
  const dir = join(RESOURCES_DIR, locale);
  const files = (await readdir(dir))
    .filter((f) => f.endsWith('.json'))
    .sort();
  const result = {};
  for (const file of files) {
    const path = join(dir, file);
    const raw = await readFile(path, 'utf8');
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      errors.push(`[parse-error] ${relative(ROOT, path)}: ${err.message}`);
      continue;
    }
    const ns = file.replace(/\.json$/, '');
    result[ns] = parsed;
  }
  return result;
}

/**
 * Prefijos de keys donde se permite divergencia intencional entre locales.
 *
 * Vacío a propósito: en este sitio **todo** el contenido —incluido el
 * de las secciones de experiencia, stack y credenciales— vive en los
 * JSON de i18n, así que las dos locales deben tener exactamente las
 * mismas claves. Si alguna vez se introduce un namespace con contenido
 * en un data file y traducciones parciales en JSON, se registra aquí su
 * prefijo.
 *
 * El matching se hace por prefijo de la key completa (formato
 * `<namespace>.<resto>`), así que cubre claves anidadas.
 */
const ALLOWED_ORPHAN_PREFIXES = [
  // Reservado para futuros namespaces con la misma asimetría
  // de "contenido en data file + traducciones en JSON".
];

/** Devuelve true si una key cae bajo algún prefijo permitido. */
function isUnderAllowedOrphanPrefix(key) {
  return ALLOWED_ORPHAN_PREFIXES.some((p) => key.startsWith(p));
}

function compareKeyParity(reference, other, refLocale, otherLocale) {
  for (const [ns, refContent] of Object.entries(reference)) {
    const otherContent = other[ns];
    if (!otherContent) {
      errors.push(
        `[missing-namespace] locale "${otherLocale}" no tiene el namespace "${ns}" (presente en "${refLocale}")`,
      );
      continue;
    }
    const refKeys = new Set(listKeys(refContent));
    const otherKeys = new Set(listKeys(otherContent));

    for (const key of refKeys) {
      if (!otherKeys.has(key)) {
        errors.push(
          `[missing-key] locale "${otherLocale}" no tiene la clave "${ns}.${key}" (presente en "${refLocale}")`,
        );
      }
    }

    // También reportar keys en `other` que no están en reference
    // (huérfanas), excepto cuando caen bajo un prefijo de
    // `ALLOWED_ORPHAN_PREFIXES` — eso es divergencia intencional.
    const otherLocalesOrphans = [...otherKeys].filter((k) => !refKeys.has(k));
    if (otherLocalesOrphans.length === 0) continue;

    const meaningfulOrphans = otherLocalesOrphans.filter(
      (k) => !isUnderAllowedOrphanPrefix(`${ns}.${k}`),
    );
    if (meaningfulOrphans.length === 0) {
      // Toda la divergencia es intencional — no warning.
      continue;
    }

    for (const key of meaningfulOrphans) {
      warnings.push(
        `[orphan-key] locale "${otherLocale}" tiene "${ns}.${key}" que no existe en "${refLocale}"`,
      );
    }
  }
}

function compareInterpolations(reference, other, refLocale, otherLocale) {
  for (const [ns, refContent] of Object.entries(reference)) {
    const otherContent = other[ns];
    if (!otherContent) continue;

    const refKeys = listKeys(refContent);
    for (const key of refKeys) {
      const refValue = getNested(refContent, key);
      const otherValue = getNested(otherContent, key);

      // Si `other` no tiene esta clave (ya reportado en la fase de
      // paridad), saltamos para no duplicar ruido.
      if (otherValue === undefined) continue;

      const refVars = extractInterpolations(refValue);
      const otherVars = extractInterpolations(otherValue);
      if (refVars.size === 0 && otherVars.size === 0) continue;

      // Sólo comparar si la referencia tiene variables — sin esto,
      // un texto en reference sin var que aparece en other con var
      // se consideraría OK (lo cual es cierto a efectos de runtime,
      // pero queremos alertar sobre discrepancias).
      const refArr = [...refVars].sort();
      const otherArr = [...otherVars].sort();
      if (refArr.join(',') !== otherArr.join(',')) {
        errors.push(
          `[interpolation-mismatch] "${ns}.${key}" — ${refLocale}=[${refArr.join(',')}] vs ${otherLocale}=[${otherArr.join(',')}]`,
        );
      }
    }
  }
}

function getNested(obj, dottedPath) {
  return dottedPath.split('.').reduce((acc, seg) => {
    if (acc && typeof acc === 'object' && seg in acc) {
      return acc[seg];
    }
    return undefined;
  }, obj);
}

async function main() {
  console.log(
    `[i18n] checking parity for ${pad(REFERENCE_LOCALE, 8)} ↔ ${CHECKED_LOCALE}`,
  );
  const ref = await loadLocale(REFERENCE_LOCALE);
  const other = await loadLocale(CHECKED_LOCALE);

  compareKeyParity(ref, other, REFERENCE_LOCALE, CHECKED_LOCALE);
  compareInterpolations(ref, other, REFERENCE_LOCALE, CHECKED_LOCALE);

  // --- Reporte ---
  if (errors.length === 0 && warnings.length === 0) {
    console.log(`[i18n] OK — all namespaces present, keys balanced, no interpolation mismatches`);
    process.exit(0);
  }

  if (warnings.length > 0) {
    console.warn(`\n[i18n] ${warnings.length} warning(s):`);
    for (const w of warnings) console.warn(`  ${w}`);
  }

  if (errors.length > 0) {
    console.error(`\n[i18n] ${errors.length} error(s):`);
    for (const e of errors) console.error(`  ${e}`);
    process.exit(1);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error('[i18n] unexpected error:', err);
  process.exit(2);
});
