import { PALETA_JUGADOR } from '../datos/coloresJugador';
import { TONOS_APP, type NombreTono } from './tonos';

interface Props {
  titulo: string;
  valor: NombreTono;
  /** Color que no se puede repetir (el del otro selector del mismo jugador). */
  bloqueado?: NombreTono;
  onCambiar: (tono: NombreTono) => void;
}

/** Fila de muestras de color para elegir el de la tarjeta o el del fondo del emoji. */
export function SelectorColor({ titulo, valor, bloqueado, onCambiar }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{titulo}</span>
      <div className="grid grid-cols-6 gap-2" role="radiogroup" aria-label={titulo}>
        {PALETA_JUGADOR.map((tono) => {
          const activo = tono === valor;
          const deshabilitado = tono === bloqueado;
          return (
            <button
              key={tono}
              type="button"
              role="radio"
              aria-checked={activo}
              aria-label={tono}
              disabled={deshabilitado}
              onClick={() => onCambiar(tono)}
              className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full border-2 border-white ${TONOS_APP[tono].punto} ${
                activo ? 'ring-4 ring-slate-400' : 'ring-1 ring-slate-300'
              } disabled:opacity-25`}
            >
              {activo && <span className="text-sm font-bold text-white">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
