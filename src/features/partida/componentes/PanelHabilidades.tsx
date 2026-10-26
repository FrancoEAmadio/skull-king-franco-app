import { useState } from 'react';
import { useApp } from '../../../estado/AppProvider';
import { estaReglaActiva } from '../../../dominio/disponibilidadContenido';
import { Seccion } from '../../../ui/Seccion';
import { vibrar } from '../../../infra/vibracion';

interface Props {
  numero?: number;
  abierto: boolean;
  onToggle: () => void;
}

type HabId = 'bribon_rotan' | 'harry_gigante' | 'kong';
type HabCopiada = 'Bribón de Roatán' | 'Harry el Gigante';

const PUNTOS_BRIBON = [0, 10, 20] as const;

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

/** Tres botones en fila (0, +10, +20): el elegido queda encendido y al tocar otro se reemplaza al instante. */
function TogglesBribon({
  etiqueta,
  valor,
  deshabilitado,
  onElegir,
}: {
  etiqueta: string;
  valor: number;
  deshabilitado: boolean;
  onElegir: (pts: number) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={etiqueta}>
      {PUNTOS_BRIBON.map((pts) => {
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
            className={`min-h-12 rounded-xl py-3 text-lg font-black disabled:opacity-40 ${
              activo ? 'opcion-activa' : 'opcion-inactiva'
            }`}
          >
            {pts === 0 ? '0' : `+${pts}`}
          </button>
        );
      })}
    </div>
  );
}

export function PanelHabilidades({ numero, abierto, onToggle }: Props) {
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
  const [habCopiada, setHabCopiada] = useState<HabCopiada>('Bribón de Roatán');

  if (!jugadorActual) return null;

  const nombre = jugadorActual.nombre;
  const kongActivo = estaReglaActiva(configuracionMesa, 'primerOficialKong');

  const registroBribon = registroHabilidadesRonda.find((h) => h.tipo === 'Bribón de Roatán');
  const bribonDeOtro = !!registroBribon && registroBribon.jugadorIdx !== jugadorSeleccionadoIdx;
  const ptsBribon = registroBribon && !bribonDeOtro ? (jugadorActual.bribonHabilidadPts ?? 0) : 0;

  const registroKongBribon = registroHabilidadesRonda.find(
    (h) => h.tipo === 'Primer Oficial Kong' && h.etiqueta.includes('Bribón')
  );
  const kongBribonDeOtro = !!registroKongBribon && registroKongBribon.jugadorIdx !== jugadorSeleccionadoIdx;
  const ptsKongBribon = registroKongBribon && !kongBribonDeOtro ? (jugadorActual.bribonHabilidadPts ?? 0) : 0;

  const bribonUsado = esHabilidadYaRegistrada('Bribón de Roatán');
  const harryUsado = esHabilidadYaRegistrada('Harry el Gigante');

  // Regla: Kong solo copia una habilidad que ya se usó antes en la ronda (Bribón o Harry) y que no copió ya.
  const kongPuedeCopiarBribon = bribonUsado && (!registroKongBribon || !kongBribonDeOtro);
  const kongPuedeCopiarHarry = harryUsado && !esKongYaRegistradoCon('Harry');
  const kongHabilitado = kongPuedeCopiarBribon || kongPuedeCopiarHarry;

  const habilitada: Record<HabId, boolean> = {
    bribon_rotan: !bribonDeOtro,
    harry_gigante: !harryUsado,
    kong: kongActivo && kongHabilitado,
  };
  const habilidadEfectiva: HabId | null = habilitada[habSeleccionada]
    ? habSeleccionada
    : (['bribon_rotan', 'harry_gigante', 'kong'] as const).find((id) => habilitada[id]) ?? null;

  const copiadaEfectiva: HabCopiada =
    habCopiada === 'Bribón de Roatán' && !kongPuedeCopiarBribon && kongPuedeCopiarHarry
      ? 'Harry el Gigante'
      : habCopiada === 'Harry el Gigante' && !kongPuedeCopiarHarry && kongPuedeCopiarBribon
        ? 'Bribón de Roatán'
        : habCopiada;

  const botonesHarry = (copia: boolean) => (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={() =>
          copia
            ? aplicarKongHarryGigante(jugadorSeleccionadoIdx, 1)
            : aplicarHarryGigante(jugadorSeleccionadoIdx, 1)
        }
        className="min-h-12 rounded-xl bg-emerald-700 py-2.5 text-base font-extrabold text-white active:scale-[0.98]"
      >
        +1 al envite
      </button>
      <button
        type="button"
        onClick={() =>
          copia
            ? aplicarKongHarryGigante(jugadorSeleccionadoIdx, -1)
            : aplicarHarryGigante(jugadorSeleccionadoIdx, -1)
        }
        className="min-h-12 rounded-xl bg-rose-800 py-2.5 text-base font-extrabold text-white active:scale-[0.98]"
      >
        −1 al envite
      </button>
    </div>
  );

  return (
    <Seccion
      numero={numero}
      titulo="Habilidades de piratas"
      marcador={`${registroHabilidadesRonda.length}/3`}
      abierto={abierto}
      onToggle={onToggle}
    >
      {habilidadesBloqueadasPorLimite ? (
        <p className="py-1 text-center text-base text-slate-300">Se alcanzó el límite de 3 habilidades por ronda.</p>
      ) : (
        <>
          <span className="text-left text-lg font-black text-white">
            Habilidad pirata de <span className="text-amber-300">{nombre}</span>
          </span>

          <div className="grid grid-cols-1 gap-2">
            <Opcion
              activa={habilidadEfectiva === 'bribon_rotan'}
              deshabilitada={!habilitada.bribon_rotan}
              onClick={() => setHabSeleccionada('bribon_rotan')}
            >
              Bribón de Roatán {bribonUsado ? '✓' : ''}
            </Opcion>
            <Opcion
              activa={habilidadEfectiva === 'harry_gigante'}
              deshabilitada={!habilitada.harry_gigante}
              onClick={() => setHabSeleccionada('harry_gigante')}
            >
              Harry el Gigante {harryUsado ? '✓' : ''}
            </Opcion>
            {kongActivo && (
              <Opcion
                activa={habilidadEfectiva === 'kong'}
                deshabilitada={!habilitada.kong}
                onClick={() => setHabSeleccionada('kong')}
              >
                Primer Oficial Kong
                {!kongHabilitado && (
                  <span className="block text-sm font-semibold text-slate-300">
                    Primero hay que usar a Bribón o a Harry
                  </span>
                )}
              </Opcion>
            )}
          </div>

          {habilidadEfectiva === 'bribon_rotan' && (
            <div className="flex flex-col gap-2 text-left">
              <span className="text-sm font-bold uppercase text-slate-300">
                Puntos en juego (+ si cumple, − si falla)
              </span>
              <TogglesBribon
                etiqueta={`Apuesta de puntos de ${nombre}`}
                valor={ptsBribon}
                deshabilitado={bribonDeOtro}
                onElegir={(pts) => elegirPuntosBribon(jugadorSeleccionadoIdx, pts)}
              />
              {bribonDeOtro && (
                <span className="text-sm font-semibold text-amber-300">
                  El Bribón de Roatán ya lo usó {registroBribon?.jugadorNombre} en esta ronda.
                </span>
              )}
            </div>
          )}

          {habilidadEfectiva === 'harry_gigante' && (
            <div className="flex flex-col gap-2 text-left">
              <span className="text-base text-slate-200">
                Modifica el envite de <strong className="text-white">{nombre}</strong> (hoy: {jugadorActual.apuesta}):
              </span>
              {botonesHarry(false)}
            </div>
          )}

          {kongActivo && habilidadEfectiva === 'kong' && (
            <div className="flex flex-col gap-2.5 text-left">
              <span className="text-sm font-bold uppercase text-slate-300">Kong copia la habilidad de:</span>
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
                  <TogglesBribon
                    etiqueta={`Apuesta copiada por Kong para ${nombre}`}
                    valor={ptsKongBribon}
                    deshabilitado={kongBribonDeOtro}
                    onElegir={(pts) => elegirPuntosBribon(jugadorSeleccionadoIdx, pts, true)}
                  />
                  {kongBribonDeOtro && (
                    <span className="text-sm font-semibold text-amber-300">
                      Kong ya copió al Bribón con {registroKongBribon?.jugadorNombre} en esta ronda.
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="text-base text-slate-200">
                    Modifica el envite de <strong className="text-white">{nombre}</strong> con la copia de Harry:
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
          <span className="text-sm font-bold uppercase text-slate-300">Habilidades en esta ronda</span>
          {registroHabilidadesRonda.map((h, idx) => (
            <div
              key={h.id}
              className="flex items-center justify-between rounded-xl border border-purple-400/40 bg-slate-950/80 p-2.5 text-base"
            >
              <div className="flex flex-col text-left">
                <span className="font-bold text-purple-200">
                  {h.etiqueta} <span className="text-sm text-slate-300">({h.jugadorNombre})</span>
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
    </Seccion>
  );
}
