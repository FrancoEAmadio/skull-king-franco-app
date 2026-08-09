import { useState } from 'react';
import { useApp } from '../../../estado/AppProvider';
import { MAX_ALIANZAS_POR_RONDA } from '../../../constantes';

export function PanelAlianzasBotin() {
  const { partida } = useApp();
  const {
    jugadores,
    alianzasBotinRonda,
    agregarAlianzaBotin,
    eliminarAlianzaBotin,
  } = partida;

  const [idxA, setIdxA] = useState(0);
  const [idxB, setIdxB] = useState(1);

  const limiteAlcanzado = alianzasBotinRonda.length >= MAX_ALIANZAS_POR_RONDA;

  const agregar = () => {
    agregarAlianzaBotin(idxA, idxB);
  };

  return (
    <div className="tarjeta-marron p-3">
      <label className="block text-xs uppercase tracking-wider text-amber-300 font-bold mb-2">
        🤝 Alianzas de Botín
      </label>

      {limiteAlcanzado ? (
        <p className="text-xs text-slate-400 text-center py-2">
          Ya se registraron las {MAX_ALIANZAS_POR_RONDA} alianzas máximas de esta ronda.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <select
              value={idxA}
              onChange={(e) => setIdxA(Number(e.target.value))}
              className="w-full text-amber-300 text-xs bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5"
            >
              {jugadores.map((jug, idx) => (
                <option key={idx} value={idx}>
                  {jug.nombre}
                </option>
              ))}
            </select>
            <select
              value={idxB}
              onChange={(e) => setIdxB(Number(e.target.value))}
              className="w-full text-amber-300 text-xs bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5"
            >
              {jugadores.map((jug, idx) => (
                <option key={idx} value={idx}>
                  {jug.nombre}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={agregar}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl"
          >
            + Registrar Alianza (+20 pts c/u si ambos aciertan)
          </button>
        </div>
      )}

      {alianzasBotinRonda.length > 0 && (
        <div className="flex flex-col gap-1.5 mt-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase">
            Alianzas en esta ronda:
          </span>
          {alianzasBotinRonda.map((alianza, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 bg-slate-900/90 border border-amber-900/60 rounded-xl text-xs"
            >
              <span className="font-bold text-amber-300">
                {alianza.nombreA} 🤝 {alianza.nombreB}
              </span>
              <button
                type="button"
                onClick={() => eliminarAlianzaBotin(idx)}
                className="text-xs text-red-400 hover:text-red-300 font-bold px-2 py-1 rounded bg-slate-800"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
