import type { SVGProps } from 'react';

/** Símbolos propios y simples (originales, no es arte oficial del juego). Se pintan con currentColor. */
const DIBUJOS = {
  skull: (
    <>
      <path fillRule="evenodd" d="M12 2.5c-4.6 0-8 3.2-8 7.4 0 2.5 1.2 4.4 3 5.6V19c0 .8.6 1.5 1.5 1.5h7c.9 0 1.5-.7 1.5-1.5v-3.5c1.8-1.2 3-3.1 3-5.6 0-4.2-3.4-7.4-8-7.4zM8.6 8.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM15.4 8.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM12 12.8l-1.3 2.6h2.6z"/>
    </>
  ),
  sables: (
    <>
      <g fill="none" strokeWidth="2" strokeLinecap="round"><path d="M4 4l12 12M14 18l4-4M16 16l4 4"/><path d="M20 4L8 16M6 14l4 4M8 16l-4 4"/></g>
    </>
  ),
  ancla: (
    <>
      <g fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="2"/><path d="M12 7v13M8 10h8M5 14c0 4 3 6 7 6s7-2 7-6M3.5 15.5L5 13.5l2 2M20.5 15.5L19 13.5l-2 2"/></g>
    </>
  ),
  timon: (
    <>
      <g fill="none" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5.5"/><path d="M12 2.5v6M12 15.5v6M2.5 12h6M15.5 12h6M5.3 5.3l4.2 4.2M14.5 14.5l4.2 4.2M18.7 5.3l-4.2 4.2M9.5 14.5l-4.2 4.2"/></g>
    </>
  ),
  corona: (
    <>
      <path d="M3 18h18l1.5-10-5 4L12 5 7 12l-5-4zM3 19.5h18v2H3z"/>
    </>
  ),
} as const;

export type NombreSimbolo = keyof typeof DIBUJOS;

interface Props extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  nombre: NombreSimbolo;
  tamano?: number;
}

export function SimboloPirata({ nombre, tamano = 24, ...resto }: Props) {
  const esLinea = nombre === 'sables' || nombre === 'ancla' || nombre === 'timon';
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 24 24"
      fill={esLinea ? 'none' : 'currentColor'}
      stroke={esLinea ? 'currentColor' : 'none'}
      aria-hidden="true"
      {...resto}
    >
      {DIBUJOS[nombre]}
    </svg>
  );
}
