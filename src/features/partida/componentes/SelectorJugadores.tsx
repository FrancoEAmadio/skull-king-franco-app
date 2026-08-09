import { useState } from 'react';
import { useApp } from '../../../estado/AppProvider';

export function SelectorJugadores() {
  const {
    jugadoresPermanentes,
    crearJugadorPermanente,
    partida: { alternarSeleccionJugador, posicionSeleccion },
  } = useApp();

  const [nombreNuevo, setNombreNuevo] = useState('');

  const crear = () => {
    const nuevo = crearJugadorPermanente(nombreNuevo);
    if (nuevo) setNombreNuevo('');
  };

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm text-slate-200 font-semibold">
          ¿Quiénes juegan? (2 a 9)
        </label>
        <span className="text-[11px] text-amber-300/80 font-medium">
          El orden de toque define el turno
        </span>
      </div>

      {jugadoresPermanentes.length === 0 && (
        <div className="tarjeta-marron p-4 text-xs text-slate-300 text-center">
          Todavía no creaste ninguna tarjeta de jugador. Agregá el primer pirata acá abajo 👇
        </div>
      )}

      <div className="grid grid-cols-2 gap-2.5">
        {jugadoresPermanentes.map((jug) => {
          const posicion = posicionSeleccion(jug.id);
          const seleccionado = posicion !== null;
          return (
            <button
              key={jug.id}
              type="button"
              onClick={() => alternarSeleccionJugador(jug.id)}
              className={`p-3 rounded-xl border text-left font-bold text-sm transition-all flex items-center gap-2 ${
                seleccionado ? 'btn-blanco-marron' : 'btn-marron-oscuro'
              }`}
            >
              {seleccionado ? (
                <span className="badge-orden-jugador">{posicion}</span>
              ) : (
                <span className="text-slate-500 font-normal">🏴‍☠️</span>
              )}
              <span className="truncate">{jug.nombre}</span>
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <input
          value={nombreNuevo}
          onChange={(e) => setNombreNuevo(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && crear()}
          type="text"
          placeholder="Nombre del nuevo pirata..."
          className="flex-1 rounded-xl px-3.5 py-2.5 text-sm text-white bg-slate-900 border border-slate-700 focus:outline-none focus:border-amber-500"
        />
        <button onClick={crear} className="px-4 py-2.5 btn-blanco-marron rounded-xl font-bold text-sm">
          + Crear
        </button>
      </div>
    </section>
  );
}
