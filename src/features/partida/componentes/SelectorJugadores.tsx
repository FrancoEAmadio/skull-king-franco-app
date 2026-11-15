import { useState } from 'react';
import { useApp } from '../../../estado/AppProvider';
import { MIN_JUGADORES } from '../../../constantes';
import { ModalSeleccionJugadores } from './ModalSeleccionJugadores';

export function SelectorJugadores() {
  const {
    partida: { idsJugadoresSeleccionados },
  } = useApp();
  const [selectorAbierto, setSelectorAbierto] = useState(false);
  const faltan = idsJugadoresSeleccionados.length < MIN_JUGADORES;

  return (
    <section className="tarjeta flex flex-col gap-3 p-4">
      <h3 className="tarjeta-titulo">3. Jugadores</h3>
      <button
        type="button"
        onClick={() => setSelectorAbierto(true)}
        className={`btn-claro flex w-full items-center justify-between px-4 py-3.5 text-left ${faltan ? 'latir' : ''}`}
      >
        <span className="text-sm font-bold">Seleccionar jugadores</span>
        <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-azul-vivo px-2 text-xs font-bold text-white">
          {idsJugadoresSeleccionados.length}
        </span>
      </button>
      <ModalSeleccionJugadores abierto={selectorAbierto} onCerrar={() => setSelectorAbierto(false)} />
    </section>
  );
}
