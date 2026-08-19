import { useState } from 'react';
import { useApp } from '../../../estado/AppProvider';
import { ModalSeleccionJugadores } from './ModalSeleccionJugadores';

export function SelectorJugadores() {
  const {
    partida: { idsJugadoresSeleccionados },
  } = useApp();
  const [selectorAbierto, setSelectorAbierto] = useState(false);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-200">¿Quiénes juegan?</label>
        <span className="text-[11px] font-medium text-amber-300/80">
          El orden de toque define el turno
        </span>
      </div>

      <button
        type="button"
        onClick={() => setSelectorAbierto(true)}
        className="btn-marron-oscuro flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left"
      >
        <div>
          <span className="block text-base font-black text-white">Seleccionar jugadores</span>
          <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Abrir listado de piratas
          </span>
        </div>
        <span className="badge-orden-jugador shrink-0">{idsJugadoresSeleccionados.length}</span>
      </button>

      <ModalSeleccionJugadores
        abierto={selectorAbierto}
        onCerrar={() => setSelectorAbierto(false)}
      />
    </section>
  );
}
