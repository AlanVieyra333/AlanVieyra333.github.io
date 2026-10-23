import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import { initI18n, i18n } from '@/i18n';
import LocaleApp from '@components/LocaleApp';
import Home from '@pages/Home';
import {
  CREDENTIAL_GROUP_IDS,
  CV_RELEASES_URL,
  EXPERIENCE_IDS,
  METRIC_IDS,
  PROJECT_IDS,
  STACK_GROUP_IDS,
} from '@/content/profile';

/**
 * Pruebas de contenido del portafolio.
 *
 * El sitio no tenía pruebas de contenido: sólo de routing e de i18n.
 * Estas comprueban que **cada entrada declarada en
 * `src/content/profile.ts` aparece renderizada**, en los dos idiomas, y
 * que cada enlace interno tiene destino.
 *
 * Dos detalles que hacen que el test signifique algo:
 *
 *   1. Se resuelve la clave contra el recurso de i18n y se comprueba que
 *      **existe**: i18next devuelve la propia clave cuando falta, y esa
 *      clave acaba renderizada en el DOM. Sin esta comprobación, un
 *      `toContain` compararía la clave consigo misma y el test
 *      pasaría con el contenido roto.
 *
 *   2. Se comprueba además que **no queda ninguna clave sin resolver en
 *      el DOM**: si un componente leyera la clave desde el namespace
 *      equivocado, i18next la renderizaría en crudo y el texto
 *      aparecería.
 */

initI18n();

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
});

/**
 * Resuelve una clave del namespace `ns` y falla si la traducción no
 * existe. Devuelve el valor resuelto.
 */
function resolve(ns: string, key: string): string {
  const value = i18n.t(`${ns}:${key}`);
  expect(value, `falta la traducción ${ns}:${key}`).not.toBe(key);
  return value;
}

function renderHome(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/:locale/*" element={<LocaleApp />}>
          <Route index element={<Home />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

/** Espera al primer render con contenido y devuelve el texto de la página. */
async function renderAndRead(path: string): Promise<string> {
  renderHome(path);
  await screen.findByRole('heading', { level: 1 });
  return document.body.textContent ?? '';
}

/**
 * Patrón de una clave de i18n sin resolver que se haya colado en el DOM.
 *
 * i18next devuelve la propia clave cuando no la encuentra, así que
 * acaba renderizada como `metrics.items.reachX.value`: tres segmentos
 * en camelCase separados por puntos. Ningún texto del sitio tiene esa
 * forma.
 */
const UNRESOLVED_KEY = /\b[a-z][a-zA-Z]*(?:\.[a-zA-Z][a-zA-Z]*){2,}\b/;

const LOCALE_CASES = [
  {
    locale: 'es-MX',
    path: '/es-MX/',
    hero: /Configuro la infraestructura/,
    sectionTitles: [
      'Ingeniería de plataforma y automatización',
      'Dónde he trabajado y qué construí',
      'Con qué trabajo',
      'Lo que está en GitHub',
      'Formación y títulos',
    ],
  },
  {
    locale: 'en-US',
    path: '/en-US/',
    hero: /I configure the infrastructure/,
    sectionTitles: [
      'Platform and automation engineering',
      'Where I worked and what I built',
      'What I work with',
      "What's on GitHub",
      'Education and certifications',
    ],
  },
] as const;

describe.each(LOCALE_CASES)('Contenido del portafolio — $locale', ({ path, hero, sectionTitles }) => {
  it('muestra el titular del hero', async () => {
    renderHome(path);
    const heading = await screen.findByRole('heading', { level: 1 });
    expect(heading.textContent).toMatch(hero);
  });

  it('renderiza las seis cifras destacadas', async () => {
    const text = await renderAndRead(path);
    for (const id of METRIC_IDS) {
      expect(text, `falta la cifra ${id}`).toContain(resolve('profile', `metrics.items.${id}.value`));
      expect(text, `falta la etiqueta ${id}`).toContain(
        resolve('profile', `metrics.items.${id}.label`),
      );
    }
  });

  it('renderiza cada puesto, con su empleador y su rol', async () => {
    const text = await renderAndRead(path);
    for (const id of EXPERIENCE_IDS) {
      expect(text, `falta el empleador ${id}`).toContain(
        resolve('experience', `items.${id}.employer`),
      );
      expect(text, `falta el rol ${id}`).toContain(resolve('experience', `items.${id}.role`));
      expect(text, `falta el periodo ${id}`).toContain(
        resolve('experience', `items.${id}.period`),
      );
    }
  });

  it('renderiza los grupos de stack', async () => {
    const text = await renderAndRead(path);
    for (const id of STACK_GROUP_IDS) {
      expect(text, `falta el grupo ${id}`).toContain(resolve('stack', `groups.${id}.title`));
    }
  });

  it('renderiza los repositorios abiertos y sus enlaces', async () => {
    const text = await renderAndRead(path);
    for (const id of PROJECT_IDS) {
      expect(text, `falta el proyecto ${id}`).toContain(resolve('projects', `items.${id}.title`));
      const href = resolve('projects', `items.${id}.href`);
      const link = document.querySelector(`a[href="${href}"]`);
      expect(link, `falta el enlace del proyecto ${id}`).not.toBeNull();
      expect(link?.getAttribute('rel')).toContain('noopener');
    }
  });

  it('renderiza los grupos de credenciales', async () => {
    const text = await renderAndRead(path);
    for (const id of CREDENTIAL_GROUP_IDS) {
      expect(text, `falta el grupo ${id}`).toContain(
        resolve('credentials', `groups.${id}.title`),
      );
    }
  });

  it('renderiza los títulos de todas las secciones', async () => {
    const text = await renderAndRead(path);
    for (const title of sectionTitles) {
      expect(text, `falta la sección "${title}"`).toContain(title);
    }
  });

  it('no deja ninguna clave de i18n sin resolver en el DOM', async () => {
    await renderAndRead(path);
    // Una clave sin resolver se renderiza en crudo, con puntos
    // (`metrics.items.reachX.value`). Se revisa el texto de la página
    // sin los `<script>`: el JSON-LD lleva URLs con puntos y daría
    // falsos positivos.
    const main = document.querySelector('main');
    expect(main).not.toBeNull();
    const clone = main?.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('script').forEach((node) => node.remove());
    const text = clone.textContent ?? '';

    expect(text, 'hay una clave de i18n sin resolver en la página').not.toMatch(
      UNRESOLVED_KEY,
    );
  });

  it('enlaza al último release del CV, no a un PDF suelto', async () => {
    await renderAndRead(path);
    const cvLink = document.querySelector(`a[href="${CV_RELEASES_URL}"]`);
    expect(cvLink).not.toBeNull();
    expect(cvLink?.getAttribute('target')).toBe('_blank');
  });

  it('tiene destino para cada enlace interno con ancla', async () => {
    await renderAndRead(path);
    const anchors = Array.from(document.querySelectorAll('a[href*="#"]'));
    expect(anchors.length).toBeGreaterThan(0);
    for (const anchor of anchors) {
      const href = anchor.getAttribute('href') ?? '';
      const id = href.slice(href.indexOf('#') + 1);
      if (!id) continue;
      expect(document.getElementById(id), `falta la sección #${id}`).not.toBeNull();
    }
  });
});
