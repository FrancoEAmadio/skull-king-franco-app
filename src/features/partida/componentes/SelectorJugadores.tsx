import { useState } from 'react';
import { useApp } from '../../../estado/AppProvider';
import { MIN_JUGADORES } from '../../../constantes';
import { ModalSeleccionJugadores } from './ModalSeleccionJugadores';

export function SelectorJugadores() {
  const {
    partida: { idsJugadoresSeleccionados, borrarSeleccionJugadores },
  } = useApp();
  const [selectorAbierto, setSelectorAbierto] = useState(false);
  const faltan = idsJugadoresSeleccionados.length < MIN_JUGADORES;

  return (
    <section className="tarjeta flex flex-col gap-3 p-4">
      <h3 className="tarjeta-titulo">3. Jugadores</h3>
      <div className="flex flex-col gap-2 rounded-2xl border-2 border-slate-200 bg-slate-50 p-2.5">
        <button
          type="button"
          onClick={() => setSelectorAbierto(true)}
          className={`btn-claro flex w-full items-center justify-between px-4 py-3.5 text-left ${faltan ? 'latir' : ''}`}
        >
          <span className="text-sm font-black">Seleccionar jugadores</span>
          <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-azul-vivo px-2 text-xs font-black text-white">
            {idsJugadoresSeleccionados.length}
          </span>
        </button>
        {idsJugadoresSeleccionados.length > 0 && (
          <button type="button" onClick={borrarSeleccionJugadores} className="btn-peligro mx-auto px-5 py-2.5 text-sm">
            Borrar selección
          </button>
        )}
      </div>
      <ModalSeleccionJugadores abierto={selectorAbierto} onCerrar={() => setSelectorAbierto(false)} />
    </section>
  );
}
