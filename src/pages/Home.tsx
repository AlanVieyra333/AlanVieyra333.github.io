import { useTranslation } from 'react-i18next';
import PageMeta from '@components/PageMeta';
import Hero from '@components/Hero';
import Profile from '@components/Profile';
import Experience from '@components/Experience';
import Stack from '@components/Stack';
import Projects from '@components/Projects';
import Credentials from '@components/Credentials';
import Contact from '@components/Contact';
import { useLocale } from '@/i18n/useLocale';

/**
 * Página principal del portafolio.
 *
 * El orden de las secciones es deliberado y es el mismo que la
 * navegación: perfil → experiencia → stack → proyectos → credenciales →
 * contacto. El CV no está en la navegación porque el CTA del hero
 * lleva directamente a la última versión publicada.
 */
export default function Home() {
  const { t } = useTranslation('meta');
  const { locale } = useLocale();
  return (
    <>
      <PageMeta
        title={t('home.title')}
        description={t('home.description')}
        path="/"
        schemaType="home"
        locale={locale}
      />
      <Hero />
      <Profile />
      <Experience />
      <Stack />
      <Projects />
      <Credentials />
      <Contact />
    </>
  );
}
