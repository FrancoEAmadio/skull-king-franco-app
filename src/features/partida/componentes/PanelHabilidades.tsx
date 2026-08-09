import { useState } from 'react';
import { useApp } from '../../../estado/AppProvider';

interface Props {
  abierto: boolean;
  onToggle: () => void;
}

type HabId = 'bribon_rotan' | 'harry_gigante' | 'kong';
type HabCopiada = 'Bribón de Roatán' | 'Harry el Gigante';

export function PanelHabilidades({ abierto, onToggle }: Props) {
  const { partida } = useApp();
  const {
    jugadores,
    registroHabilidadesRonda,
    habilidadesBloqueadasPorLimite,
    esHabilidadYaRegistrada,
    esKongYaRegistradoCon,
    aplicarBribonRotan,
    aplicarHarryGigante,
    aplicarKongCopiaBribon,
    aplicarKongHarryGigante,
    eliminarRegistroHabilidad,
  } = partida;

  const [habSeleccionada, setHabSeleccionada] = useState<HabId>('bribon_rotan');
  const [habJugadorIdx, setHabJugadorIdx] = useState(0);
  const [habPuntosBribon, setHabPuntosBribon] = useState(0);
  const [habHabilidadCopiada, setHabHabilidadCopiada] = useState<HabCopiada>('Bribón de Roatán');

  const bloqueado = habilidadesBloqueadasPorLimite;

  return (
    <div className={`p-3 rounded-2xl transition-all ${bloqueado ? 'bg-slate-900/50 border border-slate-800' : 'tarjeta-marron'}`}>
      <div
        className="flex justify-between items-center cursor-pointer select-none"
        onClick={onToggle}
      >
        <label className="block text-xs uppercase tracking-wider text-amber-300 font-bold cursor-pointer">
          🏴‍☠️ Habilidades de Piratas
        </label>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-bold">
            {registroHabilidadesRonda.length}/3
          </span>
          <span className="text-amber-400 font-bold text-base px-1">
            {abierto ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {abierto && (
        <div className="flex flex-col gap-3 mt-3 pt-3 border-t border-slate-800/80">
          {bloqueado ? (
            <p className="text-xs text-slate-400 text-center py-2">
              Se alcanzó el límite de 3 habilidades por ronda.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col text-left">
                  <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">
                    Habilidad:
                  </label>
                  <select
                    value={habSeleccionada}
                    onChange={(e) => setHabSeleccionada(e.target.value as HabId)}
                    className="w-full text-amber-300 text-xs bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5"
                  >
                    <option value="bribon_rotan" disabled={esHabilidadYaRegistrada('Bribón de Roatán')}>
                      Bribón de Roatán {esHabilidadYaRegistrada('Bribón de Roatán') ? '✓' : ''}
                    </option>
                    <option value="harry_gigante" disabled={esHabilidadYaRegistrada('Harry el Gigante')}>
                      Harry el Gigante {esHabilidadYaRegistrada('Harry el Gigante') ? '✓' : ''}
                    </option>
                    <option value="kong">Primer Oficial Kong</option>
                  </select>
                </div>

                <div className="flex flex-col text-left">
                  <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">
                    Pirata que la utilizó:
                  </label>
                  <select
                    value={habJugadorIdx}
                    onChange={(e) => setHabJugadorIdx(Number(e.target.value))}
                    className="w-full text-amber-300 text-xs bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5"
                  >
                    {jugadores.map((jug, idx) => (
                      <option key={idx} value={idx}>
                        {jug.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {habSeleccionada === 'bribon_rotan' && (
                <div className="mt-1 flex flex-col gap-2">
                  <div className="flex flex-col text-left">
                    <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">
                      Apuesta de puntos de riesgo:
                    </label>
                    <select
                      value={habPuntosBribon}
                      onChange={(e) => setHabPuntosBribon(Number(e.target.value))}
                      className="w-full text-amber-300 text-xs bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5"
                    >
                      <option value={0}>0 puntos extra (Sin riesgo)</option>
                      <option value={10}>±10 puntos (+10 si cumple / −10 si falla)</option>
                      <option value={20}>±20 puntos (+20 si cumple / −20 si falla)</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => aplicarBribonRotan(habJugadorIdx, habPuntosBribon)}
                    disabled={esHabilidadYaRegistrada('Bribón de Roatán')}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl disabled:opacity-40"
                  >
                    + Registrar Bribón de Roatán (Apuesta: {habPuntosBribon} pts)
                  </button>
                </div>
              )}

              {habSeleccionada === 'harry_gigante' && (
                <div className="mt-1 flex flex-col gap-2">
                  <span className="text-[11px] text-slate-300 text-left">
                    Modifica el envite (bazas) de <strong>{jugadores[habJugadorIdx]?.nombre}</strong>:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => aplicarHarryGigante(habJugadorIdx, 1)}
                      disabled={esHabilidadYaRegistrada('Harry el Gigante')}
                      className="py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold rounded-xl disabled:opacity-40"
                    >
                      +1 al Envite
                    </button>
                    <button
                      type="button"
                      onClick={() => aplicarHarryGigante(habJugadorIdx, -1)}
                      disabled={esHabilidadYaRegistrada('Harry el Gigante')}
                      className="py-2.5 bg-rose-800 hover:bg-rose-700 text-white font-extrabold rounded-xl disabled:opacity-40"
                    >
                      -1 al Envite
                    </button>
                  </div>
                </div>
              )}

              {habSeleccionada === 'kong' && (
                <div className="mt-1 flex flex-col gap-2.5">
                  <div className="flex flex-col text-left">
                    <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">
                      Habilidad copiada por Kong:
                    </label>
                    <select
                      value={habHabilidadCopiada}
                      onChange={(e) => setHabHabilidadCopiada(e.target.value as HabCopiada)}
                      className="w-full text-purple-200 text-xs bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5"
                    >
                      <option value="Bribón de Roatán" disabled={esKongYaRegistradoCon('Bribón')}>
                        Bribón de Roatán (Apuesta de puntos: 0/10/20) {esKongYaRegistradoCon('Bribón') ? '✓' : ''}
                      </option>
                      <option value="Harry el Gigante" disabled={esKongYaRegistradoCon('Harry')}>
                        Harry el Gigante (Modificar Envite ±1) {esKongYaRegistradoCon('Harry') ? '✓' : ''}
                      </option>
                    </select>
                  </div>

                  {habHabilidadCopiada === 'Bribón de Roatán' && (
                    <div className="flex flex-col gap-2 text-left">
                      <label className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">
                        Apuesta de puntos copiada:
                      </label>
                      <select
                        value={habPuntosBribon}
                        onChange={(e) => setHabPuntosBribon(Number(e.target.value))}
                        className="w-full text-amber-300 text-xs bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5"
                      >
                        <option value={0}>0 puntos extra</option>
                        <option value={10}>±10 puntos (+10 si cumple / −10 si falla)</option>
                        <option value={20}>±20 puntos (+20 si cumple / −20 si falla)</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => aplicarKongCopiaBribon(habJugadorIdx, habPuntosBribon)}
                        disabled={esKongYaRegistradoCon('Bribón')}
                        className="w-full py-2.5 bg-purple-700 hover:bg-purple-600 text-white font-extrabold rounded-xl disabled:opacity-40"
                      >
                        + Kong copia Bribón (±{habPuntosBribon} pts)
                      </button>
                    </div>
                  )}

                  {habHabilidadCopiada === 'Harry el Gigante' && (
                    <div className="flex flex-col gap-2 text-left">
                      <span className="text-[11px] text-slate-300">
                        Modifica el envite de <strong>{jugadores[habJugadorIdx]?.nombre}</strong> con la copia de Harry:
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => aplicarKongHarryGigante(habJugadorIdx, 1)}
                          disabled={esKongYaRegistradoCon('Harry')}
                          className="py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold rounded-xl disabled:opacity-40"
                        >
                          +1 Envite (Copia)
                        </button>
                        <button
                          type="button"
                          onClick={() => aplicarKongHarryGigante(habJugadorIdx, -1)}
                          disabled={esKongYaRegistradoCon('Harry')}
                          className="py-2.5 bg-rose-800 hover:bg-rose-700 text-white font-extrabold rounded-xl disabled:opacity-40"
                        >
                          -1 Envite (Copia)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {registroHabilidadesRonda.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                Habilidades en esta ronda:
              </span>
              {registroHabilidadesRonda.map((h, idx) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between p-2.5 bg-slate-900/90 border border-purple-900/60 rounded-xl text-xs"
                >
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-purple-300">
                      {h.etiqueta} <span className="text-slate-400 text-[10px]">({h.jugadorNombre})</span>
                    </span>
                    <span className="text-[10px] text-slate-300 mt-0.5">{h.detalle}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => eliminarRegistroHabilidad(idx)}
                    className="text-xs text-red-400 hover:text-red-300 font-bold px-2 py-1 rounded bg-slate-800"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
