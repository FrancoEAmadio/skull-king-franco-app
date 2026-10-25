import { useState } from 'react';
import { useApp } from '../../../estado/AppProvider';
import { estaReglaActiva } from '../../../dominio/disponibilidadContenido';
import { vibrar } from '../../../infra/vibracion';

interface Props {
  abierto: boolean;
  onToggle: () => void;
}

type HabId = 'bribon_rotan' | 'harry_gigante' | 'kong';
type HabCopiada = 'Bribón de Roatán' | 'Harry el Gigante';

const OPCIONES_BRIBON = [0, 10, 20] as const;

interface TogglesBribonProps {
  etiqueta: string;
  valor: number;
  deshabilitado: boolean;
  onElegir: (pts: number) => void;
}

/** Tres botones en fila (0, +10, +20): el elegido queda encendido y al tocar otro se reemplaza. */
function TogglesBribon({ etiqueta, valor, deshabilitado, onElegir }: TogglesBribonProps) {
  return (
    <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={etiqueta}>
      {OPCIONES_BRIBON.map((pts) => {
        const activo = valor === pts;
        return (
          <button
            key={pts}
            type="button"
            role="radio"
            aria-checked={activo}
            disabled={deshabilitado}
            onClick={() => {
              vibrar();
              onElegir(pts);
            }}
            className={`rounded-xl py-3 text-lg font-black disabled:opacity-40 ${
              activo ? 'btn-blanco-marron' : 'btn-marron-oscuro'
            }`}
          >
            {pts === 0 ? '0' : `+${pts}`}
          </button>
        );
      })}
    </div>
  );
}

export function PanelHabilidades({ abierto, onToggle }: Props) {
  const { partida } = useApp();
  const {
    jugadorActual,
    jugadorSeleccionadoIdx,
    configuracionMesa,
    registroHabilidadesRonda,
    habilidadesBloqueadasPorLimite,
    esHabilidadYaRegistrada,
    esKongYaRegistradoCon,
    aplicarHarryGigante,
    aplicarKongHarryGigante,
    elegirPuntosBribon,
    eliminarRegistroHabilidad,
  } = partida;

  const [habSeleccionada, setHabSeleccionada] = useState<HabId>('bribon_rotan');
  const [habHabilidadCopiada, setHabHabilidadCopiada] = useState<HabCopiada>('Bribón de Roatán');

  if (!jugadorActual) return null;

  const nombre = jugadorActual.nombre;
  const bloqueado = habilidadesBloqueadasPorLimite;
  const kongDisponible = estaReglaActiva(configuracionMesa, 'primerOficialKong');

  const registroBribon = registroHabilidadesRonda.find((h) => h.tipo === 'Bribón de Roatán');
  const bribonDeOtro = !!registroBribon && registroBribon.jugadorIdx !== jugadorSeleccionadoIdx;
  const ptsBribon = registroBribon && !bribonDeOtro ? (jugadorActual.bribonHabilidadPts ?? 0) : 0;

  const registroKongBribon = registroHabilidadesRonda.find(
    (h) => h.tipo === 'Primer Oficial Kong' && h.etiqueta.includes('Bribón')
  );
  const kongBribonDeOtro =
    !!registroKongBribon && registroKongBribon.jugadorIdx !== jugadorSeleccionadoIdx;
  const ptsKongBribon =
    registroKongBribon && !kongBribonDeOtro ? (jugadorActual.bribonHabilidadPts ?? 0) : 0;

  return (
    <div className={`p-3 rounded-2xl transition-all ${bloqueado ? 'bg-slate-900/50 border border-slate-800' : 'tarjeta-marron'}`}>
      <div
        className="flex justify-between items-center cursor-pointer select-none"
        onClick={onToggle}
      >
        <label className="block text-sm uppercase tracking-wider text-amber-300 font-bold cursor-pointer">
          🏴‍☠️ Habilidades de Piratas
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400 font-bold">
            {registroHabilidadesRonda.length}/3
          </span>
          <span className="text-amber-400 font-bold text-lg px-1">
            {abierto ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {abierto && (
        <div className="flex flex-col gap-3 mt-3 pt-3 border-t border-slate-800/80">
          {bloqueado ? (
            <p className="text-sm text-slate-400 text-center py-2">
              Se alcanzó el límite de 3 habilidades por ronda.
            </p>
          ) : (
            <>
              <span className="text-base font-bold text-white text-left">
                Habilidad pirata de <span className="text-amber-300">{nombre}</span>
              </span>

              <div className="flex flex-col text-left">
                <label className="text-sm text-slate-400 font-bold uppercase block mb-1">
                  Habilidad:
                </label>
                <select
                  value={habSeleccionada}
                  onChange={(e) => setHabSeleccionada(e.target.value as HabId)}
                  className="w-full text-amber-300 text-sm bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5"
                >
                  <option value="bribon_rotan">Bribón de Roatán</option>
                  <option value="harry_gigante" disabled={esHabilidadYaRegistrada('Harry el Gigante')}>
                    Harry el Gigante {esHabilidadYaRegistrada('Harry el Gigante') ? '✓' : ''}
                  </option>
                  {kongDisponible && <option value="kong">Primer Oficial Kong</option>}
                </select>
              </div>

              {habSeleccionada === 'bribon_rotan' && (
                <div className="flex flex-col gap-2 text-left">
                  <span className="text-sm text-slate-300">
                    Puntos que arriesga <strong>{nombre}</strong> (se suman si cumple su envite, se restan si falla):
                  </span>
                  <TogglesBribon
                    etiqueta={`Apuesta de puntos de ${nombre}`}
                    valor={ptsBribon}
                    deshabilitado={bribonDeOtro}
                    onElegir={(pts) => elegirPuntosBribon(jugadorSeleccionadoIdx, pts)}
                  />
                  {bribonDeOtro && (
                    <span className="text-sm text-amber-300">
                      El Bribón de Roatán ya lo usó {registroBribon?.jugadorNombre} en esta ronda.
                    </span>
                  )}
                </div>
              )}

              {habSeleccionada === 'harry_gigante' && (
                <div className="flex flex-col gap-2 text-left">
                  <span className="text-sm text-slate-300">
                    Modifica el envite (bazas) de <strong>{nombre}</strong> (hoy: {jugadorActual.apuesta}):
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => aplicarHarryGigante(jugadorSeleccionadoIdx, 1)}
                      disabled={esHabilidadYaRegistrada('Harry el Gigante')}
                      className="py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold rounded-xl disabled:opacity-40"
                    >
                      +1 al Envite
                    </button>
                    <button
                      type="button"
                      onClick={() => aplicarHarryGigante(jugadorSeleccionadoIdx, -1)}
                      disabled={esHabilidadYaRegistrada('Harry el Gigante')}
                      className="py-2.5 bg-rose-800 hover:bg-rose-700 text-white font-extrabold rounded-xl disabled:opacity-40"
                    >
                      -1 al Envite
                    </button>
                  </div>
                </div>
              )}

              {kongDisponible && habSeleccionada === 'kong' && (
                <div className="flex flex-col gap-2.5">
                  <div className="flex flex-col text-left">
                    <label className="text-sm text-slate-400 font-bold uppercase block mb-1">
                      Habilidad copiada por Kong:
                    </label>
                    <select
                      value={habHabilidadCopiada}
                      onChange={(e) => setHabHabilidadCopiada(e.target.value as HabCopiada)}
                      className="w-full text-purple-200 text-sm bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5"
                    >
                      <option value="Bribón de Roatán">Bribón de Roatán (Apuesta de puntos: 0/10/20)</option>
                      <option value="Harry el Gigante" disabled={esKongYaRegistradoCon('Harry')}>
                        Harry el Gigante (Modificar Envite ±1) {esKongYaRegistradoCon('Harry') ? '✓' : ''}
                      </option>
                    </select>
                  </div>

                  {habHabilidadCopiada === 'Bribón de Roatán' && (
                    <div className="flex flex-col gap-2 text-left">
                      <span className="text-sm text-slate-300">
                        Apuesta de puntos que copia <strong>{nombre}</strong>:
                      </span>
                      <TogglesBribon
                        etiqueta={`Apuesta copiada por Kong para ${nombre}`}
                        valor={ptsKongBribon}
                        deshabilitado={kongBribonDeOtro}
                        onElegir={(pts) => elegirPuntosBribon(jugadorSeleccionadoIdx, pts, true)}
                      />
                      {kongBribonDeOtro && (
                        <span className="text-sm text-amber-300">
                          Kong ya copió al Bribón con {registroKongBribon?.jugadorNombre} en esta ronda.
                        </span>
                      )}
                    </div>
                  )}

                  {habHabilidadCopiada === 'Harry el Gigante' && (
                    <div className="flex flex-col gap-2 text-left">
                      <span className="text-sm text-slate-300">
                        Modifica el envite de <strong>{nombre}</strong> con la copia de Harry:
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => aplicarKongHarryGigante(jugadorSeleccionadoIdx, 1)}
                          disabled={esKongYaRegistradoCon('Harry')}
                          className="py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold rounded-xl disabled:opacity-40"
                        >
                          +1 Envite (Copia)
                        </button>
                        <button
                          type="button"
                          onClick={() => aplicarKongHarryGigante(jugadorSeleccionadoIdx, -1)}
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
              <span className="text-sm text-slate-400 font-bold uppercase">
                Habilidades en esta ronda:
              </span>
              {registroHabilidadesRonda.map((h, idx) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between p-2.5 bg-slate-900/90 border border-purple-900/60 rounded-xl text-sm"
                >
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-purple-300">
                      {h.etiqueta} <span className="text-slate-400 text-sm">({h.jugadorNombre})</span>
                    </span>
                    <span className="text-sm text-slate-300 mt-0.5">{h.detalle}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => eliminarRegistroHabilidad(idx)}
                    aria-label={`Quitar ${h.etiqueta}`}
                    className="text-sm text-red-300 hover:text-red-200 font-bold min-h-9 min-w-9 px-2 py-1 rounded bg-slate-800"
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
