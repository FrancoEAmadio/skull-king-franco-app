import { vibrar } from '../infra/vibracion';

import { TONOS_APP, type NombreTono } from './tonos';

export type TonoChip = 'neutro' | 'dorado' | NombreTono;

interface Props {
  titulo: string;
  subtitulo?: string;
  cantidad: number;
  maximo: number;
  tono?: TonoChip;
  grande?: boolean;
  /** Línea chica que aclara qué carta se capturó. */
  aclaracion?: string;
  onMas: () => void;
  onBorrar: () => void;
}

const NEUTRO = { reposo: 'bg-white border-slate-300 text-tinta', activo: 'bg-amber-50 border-oro text-tinta ring-2 ring-oro/40' };

function tonoDe(tono: TonoChip) {
  if (tono === 'neutro') return NEUTRO;
  return TONOS_APP[tono === 'dorado' ? 'amarillo' : tono];
}

/** Botón-chip vertical: cada toque suma hasta el máximo y el siguiente lo borra. */
export function ChipCompacto({ titulo, subtitulo, aclaracion, cantidad, maximo, tono = 'neutro', grande = false, onMas, onBorrar }: Props) {
  const activo = cantidad > 0;
  const bloqueado = maximo <= 0 && cantidad === 0;
  const clases = tonoDe(tono);
  return (
    <button
      type="button"
      aria-pressed={activo}
      disabled={bloqueado}
      onClick={() => {
        if (cantidad >= maximo) {
          vibrar([25, 45, 25]); // doble toque: se borró
          onBorrar();
        } else {
          vibrar();
          onMas();
        }
      }}
      className={`relative flex min-h-[3.75rem] w-full flex-col items-center justify-center gap-0.5 rounded-xl border-2 px-1.5 py-2 text-center disabled:opacity-35 ${
        activo ? clases.activo : clases.reposo
      }`}
    >
      <span className={`${grande ? 'text-xl' : 'text-[13px]'} font-bold leading-tight`}>{titulo}</span>
      {aclaracion && <span className="text-[10px] font-semibold leading-tight opacity-75">{aclaracion}</span>}
      {subtitulo && <span className="text-[11px] font-semibold leading-tight opacity-80">{subtitulo}</span>}
      {activo && maximo > 1 && (
        <span className="absolute -right-1.5 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-oro px-1.5 text-xs font-bold text-tinta-oro shadow">
          ×{cantidad}
        </span>
      )}
    </button>
  );
}
