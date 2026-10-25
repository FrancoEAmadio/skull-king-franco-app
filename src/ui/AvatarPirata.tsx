const TAMANOS = {
  sm: 'h-9 w-9 text-xl',
  md: 'h-12 w-12 text-2xl',
  lg: 'h-16 w-16 text-4xl',
  xl: 'h-20 w-20 text-5xl',
} as const;

interface Props {
  emoji: string;
  tamano?: keyof typeof TAMANOS;
  activo?: boolean;
}

export function AvatarPirata({ emoji, tamano = 'md', activo = false }: Props) {
  return (
    <span
      aria-hidden="true"
      className={`avatar-pirata ${TAMANOS[tamano]} ${activo ? 'avatar-pirata-activo' : ''}`}
    >
      {emoji}
    </span>
  );
}
