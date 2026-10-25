import { useState } from 'react';
import { useApp } from '../../../estado/AppProvider';
import { estaReglaActiva } from '../../../dominio/disponibilidadContenido';

interface Props {
  abierto: boolean;
  onToggle: () => void;
}

type HabId = 'bribon_rotan' | 'harry_gigante' | 'kong';
type HabCopiada = 'Bribón de Roatán' | 'Harry el Gigante';

const PUNTOS_BRIBON = [
  { valor: 0, etiqueta: '0' },
  { valor: 10, etiqueta: '±10' },
  { valor: 20, etiqueta: '±20' },
];

function Opcion({
  activa,
  deshabilitada,
  onClick,
  children,
}: {
  activa: boolean;
  deshabilitada?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={activa}
      disabled={deshabilitada}
      onClick={onClick}
      className={`min-h-12 rounded-xl px-3 py-2 text-base font-bold leading-tight disabled:opacity-35 ${
        activa ? 'opcion-activa' : 'opcion-inactiva'
      }`}
    >
      {children}
    </button>
  );
}

export function PanelHabilidades({ abierto, onToggle }: Props) {
  const { partida } = useApp();
  const {
    jugadores,
    jugadorSeleccionadoIdx,
    configuracionMesa,
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
  const [habJugadorIdx, setHabJugadorIdx] = useState<number | null>(null);
  const [habPuntosBribon, setHabPuntosBribon] = useState(0);
  const [habCopiada, setHabCopiada] = useState<HabCopiada>('Bribón de Roatán');

  const bloqueado = habilidadesBloqueadasPorLimite;
  const kongActivo = estaReglaActiva(configuracionMesa, 'primerOficialKong');

  const bribonUsado = esHabilidadYaRegistrada('Bribón de Roatán');
  const harryUsado = esHabilidadYaRegistrada('Harry el Gigante');
  // Regla: Kong solo copia una habilidad que ya se usó antes en la ronda (Bribón o Harry) y que no copió ya.
  const kongPuedeCopiarBribon = bribonUsado && !esKongYaRegistradoCon('Bribón');
  const kongPuedeCopiarHarry = harryUsado && !esKongYaRegistradoCon('Harry');
  const kongHabilitado = kongPuedeCopiarBribon || kongPuedeCopiarHarry;

  // Quién usó la habilidad: por defecto, el jugador que se está anotando.
  const jugadorElegido = habJugadorIdx ?? jugadorSeleccionadoIdx;
  const nombreElegido = jugadores[jugadorElegido]?.nombre ?? '';

  const copiadaEfectiva: HabCopiada =
    habCopiada === 'Bribón de Roatán' && !kongPuedeCopiarBribon && kongPuedeCopiarHarry
      ? 'Harry el Gigante'
      : habCopiada === 'Harry el Gigante' && !kongPuedeCopiarHarry && kongPuedeCopiarBribon
        ? 'Bribón de Roatán'
        : habCopiada;

  const habilidadEfectiva: HabId =
    habSeleccionada === 'kong' && !kongHabilitado
      ? 'bribon_rotan'
      : habSeleccionada === 'bribon_rotan' && bribonUsado
        ? harryUsado
          ? kongActivo && kongHabilitado
            ? 'kong'
            : 'bribon_rotan'
          : 'harry_gigante'
        : habSeleccionada === 'harry_gigante' && harryUsado
          ? bribonUsado
            ? kongActivo && kongHabilitado
              ? 'kong'
              : 'harry_gigante'
            : 'bribon_rotan'
          : habSeleccionada;

  const botonesPuntos = (
    <div className="grid grid-cols-3 gap-2">
      {PUNTOS_BRIBON.map((op) => (
        <Opcion key={op.valor} activa={habPuntosBribon === op.valor} onClick={() => setHabPuntosBribon(op.valor)}>
          {op.etiqueta}
        </Opcion>
      ))}
    </div>
  );

  const botonesHarry = (copia: boolean) => (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={() =>
          copia ? aplicarKongHarryGigante(jugadorElegido, 1) : aplicarHarryGigante(jugadorElegido, 1)
        }
        className="min-h-12 rounded-xl bg-emerald-700 py-2.5 text-base font-extrabold text-white active:scale-[0.98]"
      >
        +1 al envite
      </button>
      <button
        type="button"
        onClick={() =>
          copia ? aplicarKongHarryGigante(jugadorElegido, -1) : aplicarHarryGigante(jugadorElegido, -1)
        }
        className="min-h-12 rounded-xl bg-rose-800 py-2.5 text-base font-extrabold text-white active:scale-[0.98]"
      >
        −1 al envite
      </button>
    </div>
  );

  return (
    <div className="p-3">
      <button type="button" className="flex w-full items-center justify-between text-left" onClick={onToggle}>
        <span className="text-sm font-bold uppercase tracking-wider text-amber-300">🏴‍☠️ Habilidades de piratas</span>
        <span className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-400">{registroHabilidadesRonda.length}/3</span>
          <span className="px-1 text-lg font-bold text-amber-400">{abierto ? '▲' : '▼'}</span>
        </span>
      </button>

      {abierto && (
        <div className="mt-3 flex flex-col gap-3 border-t border-slate-800/80 pt-3">
          {bloqueado ? (
            <p className="py-2 text-center text-base text-slate-400">Se alcanzó el límite de 3 habilidades por ronda.</p>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-bold uppercase text-slate-400">¿Qué pirata usó la habilidad?</span>
                <div className="grid grid-cols-1 gap-2">
                  <Opcion
                    activa={habilidadEfectiva === 'bribon_rotan'}
                    deshabilitada={bribonUsado}
                    onClick={() => setHabSeleccionada('bribon_rotan')}
                  >
                    Bribón de Roatán {bribonUsado ? '✓' : ''}
                  </Opcion>
                  <Opcion
                    activa={habilidadEfectiva === 'harry_gigante'}
                    deshabilitada={harryUsado}
                    onClick={() => setHabSeleccionada('harry_gigante')}
                  >
                    Harry el Gigante {harryUsado ? '✓' : ''}
                  </Opcion>
                  {kongActivo && (
                    <Opcion
                      activa={habilidadEfectiva === 'kong'}
                      deshabilitada={!kongHabilitado}
                      onClick={() => setHabSeleccionada('kong')}
                    >
                      Primer Oficial Kong
                      {!kongHabilitado && (
                        <span className="block text-sm font-semibold text-slate-400">
                          Primero hay que usar a Bribón o a Harry
                        </span>
                      )}
                    </Opcion>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-bold uppercase text-slate-400">¿Quién lo usó?</span>
                <div className="flex flex-wrap gap-2">
                  {jugadores.map((jug, idx) => (
                    <Opcion key={idx} activa={jugadorElegido === idx} onClick={() => setHabJugadorIdx(idx)}>
                      {jug.nombre}
                    </Opcion>
                  ))}
                </div>
              </div>

              {habilidadEfectiva === 'bribon_rotan' && (
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-bold uppercase text-slate-400">Puntos en juego (+ si cumple, − si falla)</span>
                  {botonesPuntos}
                  <button
                    type="button"
                    onClick={() => aplicarBribonRotan(jugadorElegido, habPuntosBribon)}
                    className="min-h-12 w-full rounded-xl bg-amber-500 py-2.5 text-base font-extrabold text-black active:scale-[0.98]"
                  >
                    + Registrar Bribón para {nombreElegido} ({habPuntosBribon} pts)
                  </button>
                </div>
              )}

              {habilidadEfectiva === 'harry_gigante' && (
                <div className="flex flex-col gap-2">
                  <span className="text-base text-slate-300">
                    Modifica el envite de <strong className="text-white">{nombreElegido}</strong>:
                  </span>
                  {botonesHarry(false)}
                </div>
              )}

              {kongActivo && habilidadEfectiva === 'kong' && (
                <div className="flex flex-col gap-2.5">
                  <span className="text-sm font-bold uppercase text-slate-400">Kong copia la habilidad de:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <Opcion
                      activa={copiadaEfectiva === 'Bribón de Roatán'}
                      deshabilitada={!kongPuedeCopiarBribon}
                      onClick={() => setHabCopiada('Bribón de Roatán')}
                    >
                      Bribón de Roatán
                    </Opcion>
                    <Opcion
                      activa={copiadaEfectiva === 'Harry el Gigante'}
                      deshabilitada={!kongPuedeCopiarHarry}
                      onClick={() => setHabCopiada('Harry el Gigante')}
                    >
                      Harry el Gigante
                    </Opcion>
                  </div>

                  {copiadaEfectiva === 'Bribón de Roatán' ? (
                    <>
                      {botonesPuntos}
                      <button
                        type="button"
                        onClick={() => aplicarKongCopiaBribon(jugadorElegido, habPuntosBribon)}
                        className="min-h-12 w-full rounded-xl bg-purple-700 py-2.5 text-base font-extrabold text-white active:scale-[0.98]"
                      >
                        + Kong copia a Bribón para {nombreElegido} (±{habPuntosBribon} pts)
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-base text-slate-300">
                        Modifica el envite de <strong className="text-white">{nombreElegido}</strong>:
                      </span>
                      {botonesHarry(true)}
                    </>
                  )}
                </div>
              )}
            </>
          )}

          {registroHabilidadesRonda.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-bold uppercase text-slate-400">Habilidades en esta ronda</span>
              {registroHabilidadesRonda.map((h, idx) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between rounded-xl border border-purple-900/60 bg-slate-900/90 p-2.5 text-base"
                >
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-purple-300">
                      {h.etiqueta} <span className="text-sm text-slate-400">({h.jugadorNombre})</span>
                    </span>
                    <span className="mt-0.5 text-sm text-slate-300">{h.detalle}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => eliminarRegistroHabilidad(idx)}
                    aria-label={`Quitar ${h.etiqueta}`}
                    className="min-h-10 min-w-10 rounded bg-slate-800 px-2 py-1 text-base font-bold text-red-300"
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
