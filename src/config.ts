/**
 * Configuración del sitio.
 *
 * Esta es la única fuente de verdad para los datos de contacto, el
 * dominio canónico, los enlaces sociales y la identidad del proyecto
 * editorial. Cualquier valor aquí se propaga al Navbar, al Footer, a los
 * metadatos por página, al sitemap y al archivo de robots.
 *
 * `IS_CONTACT_CONFIGURED` es una verificación en tiempo de ejecución
 * que muestra un aviso en la sección de Contacto cuando los datos están
 * vacíos. NO bloquea el build: la protección de despliegue real la da la
 * revisión de este archivo antes de hacer commit.
 *
 * Los íconos de las redes sociales y de los canales de contacto
 * viven en archivos separados (`@/socials` y `@/contactChannels`)
 * para que `react-refresh` pueda hacer HMR de componentes sin
 * que se queje de mezclar componentes y constantes.
 */

export const SITE_NAME = 'Alan Vieyra' as const;
/** Tagline canónico. Lo consumen PageMeta y los meta estáticos. */
export const SITE_TAGLINE = 'DevOps/SRE · Full Stack · IA aplicada' as const;

/**
 * Nombre corto, como se presenta en la prosa. El nombre completo va en
 * `OWNER_FULL_NAME`, que es lo que se publica en los datos estructurados.
 */
export const OWNER_NAME = 'Alan' as const;

/** Nombre completo: es lo que se declara en el JSON-LD de tipo `Person`. */
export const OWNER_FULL_NAME = 'Alan Fernando Rincón Vieyra' as const;

/** Rol principal, como lo presenta la matriz de énfasis de los perfiles. */
export const OWNER_ROLE = 'DevOps/SRE Engineer' as const;

/** Dominio canónico del sitio. Sin slash final. */
export const SITE_URL = 'https://alanvieyra333.github.io' as const;
/**
 * Imagen social (1200×630). Apunta a la versión SVG que sí está
 * versionada; la mayoría de los unfurlers modernos la renderizan.
 */
export const OG_IMAGE = `${SITE_URL}/og.svg` as const;
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

export const CONTACT = {
  email: 'info@vieyralabs.com',
  /** E.164 sin `+`. Se usa con `wa.me/${numero}`. */
  whatsappNumber: '525591250145',
  whatsappMessage:
    'Hola, vi tu portafolio y me gustaría platicar sobre una oportunidad o un proyecto.',
  emailSubject: 'Contacto desde el portafolio',
} as const;

export const CONTACT_LINKS = {
  email: `mailto:${CONTACT.email}?subject=${encodeURIComponent(CONTACT.emailSubject)}`,
  whatsapp: `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(CONTACT.whatsappMessage)}`,
} as const;

export const IS_CONTACT_CONFIGURED =
  Boolean(CONTACT.email) && /^\d{10,15}$/.test(CONTACT.whatsappNumber);

/** Utilizado por PageMeta para normalizar URLs canónicas (sin doble slash, con trailing slash donde aplica). */
export function canonicalUrl(path: string): string {
  const normalized = path === '/' ? '/' : `/${path.replace(/^\/+/, '').replace(/\/+$/, '')}/`;
  return `${SITE_URL}${normalized}`;
}
