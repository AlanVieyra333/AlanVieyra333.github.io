import { FaGithub, FaLinkedin } from 'react-icons/fa';
import type { IconType } from 'react-icons';

export interface SocialLink {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly Icon: IconType;
}

export const SOCIALS: readonly SocialLink[] = [
  {
    id: 'github',
    label: 'GitHub de Alan Vieyra',
    href: 'https://github.com/AlanVieyra333',
    Icon: FaGithub as IconType,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn de Alan Vieyra',
    href: 'https://www.linkedin.com/in/alanvieyra333',
    Icon: FaLinkedin as IconType,
  },
];
