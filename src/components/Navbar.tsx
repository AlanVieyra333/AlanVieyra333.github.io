import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiBars3, HiXMark } from 'react-icons/hi2';
import { useTranslation } from 'react-i18next';
import Wordmark from './Wordmark';
import LanguageSelector from '@/i18n/LanguageSelector';
import { useLocale } from '@/i18n/useLocale';

/**
 * Navbar principal del sitio.
 *
 * Los items de navegación se derivan de las traducciones para que
 * tanto el texto ("Servicios") como los hrefs (`#servicios`) vivan
 * en los archivos i18n. Los IDs de los anchors son **estables**
 * entre idiomas (sección `servicios` sigue siendo `servicios` en
 * ambos idiomas); esto simplifica ScrollManager y evita traducir
 * atributos `id` del DOM.
 */
export default function Navbar() {
  const { t } = useTranslation('common');
  const { locale, localizedPath } = useLocale();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Bloquea el scroll del body cuando el menú móvil está abierto, y lo
  // restaura en cleanup. Guarda el valor previo por si otro componente
  // ya había modificado overflow.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  function closeAndReturnFocus() {
    setOpen(false);
    toggleRef.current?.focus();
  }

  const navItems = [
    {
      id: t('navbar.home.id'),
      label: t('navbar.home.label'),
      hash: t('navbar.home.href'),
    },
    {
      id: t('navbar.process.id'),
      label: t('navbar.process.label'),
      hash: t('navbar.process.href'),
    },
    {
      id: t('navbar.work.id'),
      label: t('navbar.work.label'),
      hash: t('navbar.work.href'),
    },
    {
      id: t('navbar.contact.id'),
      label: t('navbar.contact.label'),
      hash: t('navbar.contact.href'),
    },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-ink-100/60 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <nav
        aria-label={t('navbar.ariaLabel')}
        className="mx-auto flex max-w-content items-center justify-between px-gutter py-4"
      >
        <Link
          to={localizedPath('/')}
          onClick={() => setOpen(false)}
          aria-label={t('navbar.ariaHome')}
          lang={locale}
          className="text-title font-bold tracking-tight"
        >
          <Wordmark />
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <li key={item.id}>
              <Link
                to={`${localizedPath('/')}${item.hash}`}
                onClick={() => setOpen(false)}
                className="text-small font-medium text-ink-700 transition-colors duration-200 ease-out-quint hover:text-brand-700"
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <LanguageSelector variant="compact" asList />
          </li>
        </ul>

        <div className="flex items-center gap-2 md:hidden">
          <LanguageSelector variant="compact" asList={false} />
          <button
            ref={toggleRef}
            type="button"
            aria-expanded={open}
            aria-controls="menu-principal"
            aria-label={open ? t('navbar.closeMenu') : t('navbar.openMenu')}
            onClick={() => setOpen((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-card text-ink-800 transition-colors duration-200 ease-out-quint hover:bg-ink-100"
          >
            <HiBars3 className={`h-6 w-6 ${open ? 'hidden' : 'block'}`} aria-hidden="true" />
            <HiXMark className={`h-6 w-6 ${open ? 'block' : 'hidden'}`} aria-hidden="true" />
          </button>
        </div>
      </nav>

      <div
        id="menu-principal"
        hidden={!open}
        className="border-t border-ink-100 bg-white md:hidden"
      >
        <ul className="mx-auto flex max-w-content flex-col gap-1 px-gutter py-4">
          {navItems.map((item) => (
            <li key={item.id}>
              <Link
                to={`${localizedPath('/')}${item.hash}`}
                onClick={closeAndReturnFocus}
                className="block rounded-card px-3 py-3 text-body font-medium text-ink-800 transition-colors duration-200 ease-out-quint hover:bg-ink-50 hover:text-brand-700"
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li className="mt-2">
            <LanguageSelector variant="menu" asList />
          </li>
        </ul>
      </div>
    </header>
  );
}
