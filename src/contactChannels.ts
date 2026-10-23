import { FaWhatsapp } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import type { IconType } from 'react-icons';
import { CONTACT, CONTACT_LINKS } from './config';

export interface ContactChannel {
  readonly id: 'email' | 'whatsapp';
  readonly title: string;
  readonly detail: string;
  readonly cta: string;
  readonly href: string;
  readonly Icon: IconType;
  readonly primary: boolean;
}

export const CONTACT_CHANNELS: readonly ContactChannel[] = [
  {
    id: 'email',
    title: 'Envíame un correo',
    detail: 'Cuéntame del puesto o del proyecto y agendamos una reunión.',
    cta: 'Abrir en tu cliente de correo',
    href: CONTACT_LINKS.email,
    Icon: MdEmail as IconType,
    primary: true,
  },
  {
    id: 'whatsapp',
    title: 'Escríbeme por WhatsApp',
    detail: '¿Tienes alguna inquietud? Conversemos y resolvamos cualquier duda.',
    cta: 'Abrir conversación en WhatsApp',
    href: CONTACT_LINKS.whatsapp,
    Icon: FaWhatsapp as IconType,
    primary: false,
  },
];

export { CONTACT };
