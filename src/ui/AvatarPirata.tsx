const TAMANOS = {
  sm: 'h-9 w-9 text-xl',
  md: 'h-12 w-12 text-2xl',
  lg: 'h-16 w-16 text-4xl',
  xl: 'h-20 w-20 text-5xl',
} as const;

import { esImagenAvatar, urlAvatar } from '../datos/avatares';
import { FONDO_AVATAR, type NombreTono } from './tonos';

interface Props {
  emoji: string;
  /** Color de fondo; si no se pasa, queda el azul de siempre. */
  fondo?: NombreTono;
  tamano?: keyof typeof TAMANOS;
  activo?: boolean;
}

export function AvatarPirata({ emoji, fondo, tamano = 'md', activo = false }: Props) {
  const [claro, oscuro] = fondo ? FONDO_AVATAR[fondo] : [null, null];
  return (
    <span
      aria-hidden="true"
      style={claro ? { background: `radial-gradient(circle at 35% 30%, ${claro} 0%, ${oscuro} 100%)` } : undefined}
      className={`avatar-pirata ${TAMANOS[tamano]} ${activo ? 'avatar-pirata-activo' : ''}`}
    >
      {esImagenAvatar(emoji) ? (
        <img src={urlAvatar(emoji)} alt="" draggable={false} className="h-full w-full select-none object-contain p-[7%]" />
      ) : (
        emoji
      )}
    </span>
  );
}
