import { vibrar } from '../infra/vibracion';

export type TonoChip = 'neutro' | 'rojo' | 'verde' | 'dorado' | 'negro';

interface Props {
  titulo: string;
  subtitulo?: string;
  cantidad: number;
  maximo: number;
  tono?: TonoChip;
  grande?: boolean;
  onMas: () => void;
  onBorrar: () => void;
}

const TONOS: Record<TonoChip, { reposo: string; activo: string }> = {
  neutro: { reposo: 'bg-white border-slate-300 text-tinta', activo: 'bg-amber-50 border-oro text-tinta ring-2 ring-oro/40' },
  rojo: { reposo: 'bg-red-50 border-red-200 text-red-700', activo: 'bg-red-100 border-red-500 text-red-800 ring-2 ring-red-300' },
  verde: { reposo: 'bg-emerald-50 border-emerald-200 text-emerald-700', activo: 'bg-emerald-100 border-emerald-500 text-emerald-800 ring-2 ring-emerald-300' },
  dorado: { reposo: 'bg-amber-50 border-amber-300 text-amber-800', activo: 'bg-amber-200 border-oro-osc text-amber-900 ring-2 ring-oro/50' },
  negro: { reposo: 'bg-slate-100 border-slate-300 text-slate-700', activo: 'bg-slate-300 border-slate-700 text-slate-900 ring-2 ring-slate-400' },
};

/** Botón-chip vertical: cada toque suma hasta el máximo y el siguiente lo borra. */
export function ChipCompacto({ titulo, subtitulo, cantidad, maximo, tono = 'neutro', grande = false, onMas, onBorrar }: Props) {
  const activo = cantidad > 0;
  const bloqueado = maximo <= 0 && cantidad === 0;
  const clases = TONOS[tono];
  return (
    <button
      type="button"
      aria-pressed={activo}
      disabled={bloqueado}
      onClick={() => {
        vibrar();
        if (cantidad >= maximo) onBorrar();
        else onMas();
      }}
      className={`relative flex min-h-[4.25rem] w-full flex-col items-center justify-center gap-0.5 rounded-xl border-2 px-1.5 py-2 text-center disabled:opacity-35 ${
        activo ? clases.activo : clases.reposo
      }`}
    >
      <span className={`${grande ? 'font-display text-2xl' : 'text-[13px]'} font-black leading-tight`}>{titulo}</span>
      {subtitulo && <span className="text-[11px] font-bold leading-tight opacity-80">{subtitulo}</span>}
      {activo && maximo > 1 && (
        <span className="absolute -right-1.5 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-oro px-1.5 text-xs font-black text-tinta-oro shadow">
          ×{cantidad}
        </span>
      )}
    </button>
  );
}
