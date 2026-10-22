#!/usr/bin/env node
/**
 * scripts/check-editorial.mjs
 * --------------------------
 * Guardarraíl editorial del portafolio.
 *
 * El sitio es una **superficie pública** con la misma frontera
 * editorial que los ocho perfiles del currículum. La lista de
 * prohibiciones vive en `FACTS.md` §4 del repositorio `resume`; este
 * script la aplica mecánicamente al texto del sitio para que una
 * frase no se deslice sin que alguien lo note.
 *
 * Qué comprueba:
 *
 *   1. **Sin afirmaciones de ML.** La IA de este currículum es
 *      aplicada y agéntica: skills que enrutan una petición en
 *      lenguaje natural a un script determinista. No hay
 *      entrenamiento, fine-tuning, RAG, embeddings, bases
 *      vectoriales ni MLOps. Decirlo de otro modo es afirmar un
 *      trabajo que no existe.
 *
 *   2. **Sin métricas de fiabilidad no confirmadas.** No hay SLO,
 *      error budgets, postmortems ni RCA: lo único confirmado fue la
 *      guardia dentro del horario laboral y sin rotación.
 *
 *   3. **Sin guardia 24/7.**
 *
 *   4. **La arquitectura hexagonal fue revisada, no implementada.**
 *
 * Qué **no** comprueba:
 *
 *   - Los valores de tipo URL se saltan: el enlace al repositorio
 *     público sí lleva el nombre, por decisión editorial explícita.
 *   - Los nombres de empleadores y clientes: esos sí se publican, y
 *     el CV los publica igual.
 *   - **Los nombres de los proyectos que no se pueden nombrar.** Un
 *     guard que busca un nombreqc con un `grep` tiene que escribir ese
 *     nombre en su propio archivo, y este repositorio es público:
 *     el guard publicaría justo lo que debe ocultar. Por eso esa
 *     regla es una convención documentada en el README, no una
 *     comprobación mecánica.
 *
 * Salida:
 *   - Código 0 si todo pasa.
 *   - Código 1 si hay alguna infracción (imprime el detalle).
 */

import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const RESOURCES_DIR = join(ROOT, 'src', 'i18n', 'resources');

/**
 * Reglas. Cada una es un caso de `FACTS.md` §4 con su motivo, para que
 * quien lea el fallo entienda por qué está prohibido y no sólo que
 * está prohibido.
 */
const RULES = [
  {
    id: 'ml-claims',
    why: 'FACTS.md §4: la IA es aplicada y agéntica (skills que enrutan intención a scripts). No hay entrenamiento, fine-tuning, RAG, embeddings, bases vectoriales ni MLOps.',
    patterns: [
      /\bfine[- ]tun(?:e|ed|ing)?\b/i,
      /\bembeddings?\b/i,
      /\bvector (?:database|store|search)\b/i,
      /\bbases? vectoriales?\b/i,
      /\bMLOps\b/i,
      /\bRAG\b/,
      /\bLLMs?\b/,
      /\bmodel training\b/i,
      /\bentrenamiento (?:de|del) modelos?\b/i,
      /\bserving de modelos\b/i,
    ],
  },
  {
    id: 'unconfirmed-reliability-metrics',
    why: 'FACTS.md §4: no hay SLO, error budgets, objetivos de disponibilidad, postmortems ni RCA confirmados.',
    patterns: [
      /\bSLOs?\b/,
      /\berror budgets?\b/i,
      /\bpostmortems?\b/i,
      /\bRCAs?\b/,
    ],
  },
  {
    id: 'on-call-24-7',
    why: 'FACTS.md §4: la guardia confirmada fue dentro del horario laboral y sin rotación.',
    patterns: [/24\s*\/\s*7/, /\b24-7\b/, /guardia\s+24/],
  },
  {
    id: 'hexagonal-implemented',
    why: 'FACTS.md §4: la arquitectura hexagonal fue revisada, no implementada.',
    patterns: [
      /implement\w*[^.\n]{0,80}hexagonal/i,
      /hexagonal[^.\n]{0,80}implement/i,
    ],
  },
];

const errors = [];

/** Recorre un objeto JSON y devuelve las rutas de sus valores string. */
function collectStrings(obj, prefix = '', out = []) {
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      out.push({ path, value });
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      collectStrings(value, path, out);
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === 'string') {
          out.push({ path: `${path}[${index}]`, value: item });
        }
      });
    }
  }
  return out;
}

async function localeFiles(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) continue;
    files.push(join(dir, entry.name));
  }
  return files;
}

async function main() {
  const locales = (await readdir(RESOURCES_DIR, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  let checked = 0;

  for (const locale of locales) {
    const files = await localeFiles(join(RESOURCES_DIR, locale));
    for (const file of files) {
      const raw = await readFile(file, 'utf8');
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (err) {
        errors.push(`[parse-error] ${relative(ROOT, file)}: ${err.message}`);
        continue;
      }

      for (const { path, value } of collectStrings(parsed)) {
        // Las URL se saltan: el enlace al repositorio público sí lleva
        // el nombre del proyecto, por decisión editorial explícita.
        if (/^https?:\/\//i.test(value)) continue;

        for (const rule of RULES) {
          for (const pattern of rule.patterns) {
            if (pattern.test(value)) {
              errors.push(
                `[${rule.id}] ${relative(ROOT, file)} → "${path}": ${pattern}\n    ${value}\n    Motivo: ${rule.why}`,
              );
            }
          }
        }
        checked += 1;
      }
    }
  }

  if (errors.length === 0) {
    console.log(
      `[editorial] OK — ${checked} cadenas revisadas en ${locales.length} locale(s), sin infracciones.`,
    );
    process.exit(0);
  }

  console.error(`\n[editorial] ${errors.length} infracción(es):`);
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}

main().catch((err) => {
  console.error('[editorial] error inesperado:', err);
  process.exit(2);
});
