/**
 * Estructura del contenido del portafolio.
 *
 * Este módulo contiene **sólo identificadores y enlaces**, nunca prosa.
 * El texto vive en los recursos de i18n (`src/i18n/resources/<locale>/*.json`),
 * de modo que la paridad entre español e inglés la verifica
 * `scripts/check-i18n.mjs` y no depende de que alguien recuerde traducir
 * una cadena suelta dentro de un componente.
 *
 * Los identificadores son **estables** entre idiomas: la sección de
 * experiencia `veradat` es `veradat` en español y en inglés. Lo que cambia
 * es el texto, nunca la clave.
 */

/** Secciones de experiencia, en el orden en que se muestran. */
export const EXPERIENCE_IDS = [
  'veradat',
  'banamex',
  'telcel',
  'freelance-compliance',
  'independent-mobile',
] as const;
export type ExperienceId = (typeof EXPERIENCE_IDS)[number];

/** Cifras destacadas de la sección de perfil. */
export const METRIC_IDS = [
  'pipelines',
  'microservices',
  'clusters',
  'deploy',
  'automation',
  'reach',
] as const;
export type MetricId = (typeof METRIC_IDS)[number];

/** Grupos de herramientas y tecnologías. */
export const STACK_GROUP_IDS = [
  'cloud',
  'platform',
  'delivery',
  'development',
  'data',
  'quality',
] as const;
export type StackGroupId = (typeof STACK_GROUP_IDS)[number];

/** Grupos de credenciales. */
export const CREDENTIAL_GROUP_IDS = [
  'education',
  'certifications',
  'competitions',
  'languages',
] as const;
export type CredentialGroupId = (typeof CREDENTIAL_GROUP_IDS)[number];

/** Repositorios públicos destacados. */
export const PROJECT_IDS = ['resume', 'pension-estimator', 'portfolio'] as const;
export type ProjectId = (typeof PROJECT_IDS)[number];

/**
 * Último release del currículum en LaTeX: los 16 PDFs (4 perfiles × 2
 * idiomas × 2 variantes de diseño). Se enlaza al *release* y no a un
 * archivo suelto, para que el enlace nunca apunte a una versión vieja.
 */
export const CV_RELEASES_URL = 'https://github.com/AlanVieyra333/resume/releases/latest';

/** Perfil personal de GitHub. */
export const GITHUB_PROFILE_URL = 'https://github.com/AlanVieyra333';
