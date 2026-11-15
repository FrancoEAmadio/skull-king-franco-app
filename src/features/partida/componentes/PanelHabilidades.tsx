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
      className={`min-h-11 px-3 py-2 text-sm font-semibold leading-tight disabled:opacity-35 ${
        activa ? 'opcion opcion-sel' : 'opcion'
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
            className={`min-h-11 py-3 text-base font-bold disabled:opacity-40 ${
              activo ? 'opcion opcion-sel' : 'opcion'
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
    hayCartaLibreHabilidad,
    hayCartaLibreKong,
    cartasPorJugadorEnRonda,
    esHabilidadYaRegistrada,
    esKongYaRegistradoCon,
    aplicarHarryGigante,
    maxHabilidadesRonda,
    aplicarKongHarryGigante,
    elegirPuntosBribon,
    eliminarRegistroHabilidad,
  } = partida;

  const [habSeleccionada, setHabSeleccionada] = useState<HabId>('bribon_rotan');
  const [habCopiada, setHabCopiada] = useState<HabCopiada>('Bribón de Roatán');

  if (!jugadorActual) return null;

  const nombre = jugadorActual.nombre;
  const kongActivo =
    configuracionMesa.modoContenido === 'expansion' && estaReglaActiva(configuracionMesa, 'primerOficialKong');

  const registroBribon = registroHabilidadesRonda.find((h) => h.tipo === 'Bribón de Roatán');
  const bribonDeOtro = !!registroBribon && registroBribon.jugadorIdx !== jugadorSeleccionadoIdx;
  const ptsBribon = registroBribon && !bribonDeOtro ? (jugadorActual.bribonHabilidadPts ?? 0) : 0;

  const registroKongBribon = registroHabilidadesRonda.find(
    (h) => h.tipo === 'Primer Oficial Kong' && h.etiqueta.includes('Bribón')
  );
  const kongBribonDeOtro = !!registroKongBribon && registroKongBribon.jugadorIdx !== jugadorSeleccionadoIdx;
  const ptsKongBribon = registroKongBribon && !kongBribonDeOtro ? (jugadorActual.bribonHabilidadPts ?? 0) : 0;

  const registroHarry = registroHabilidadesRonda.find((h) => h.tipo === 'Harry el Gigante');
  const bribonDeEste = !!registroBribon && registroBribon.jugadorIdx === jugadorSeleccionadoIdx;
  const harryDeEste = !!registroHarry && registroHarry.jugadorIdx === jugadorSeleccionadoIdx;
  const bribonUsado = esHabilidadYaRegistrada('Bribón de Roatán');
  const harryUsado = esHabilidadYaRegistrada('Harry el Gigante');

  // Regla: Kong solo copia una habilidad que ya se usó antes en la ronda (Bribón o Harry) y que no copió ya.
  // Kong copia una habilidad que ya usó OTRO jugador: quien usó Bribón no puede copiar Bribón (y lo mismo con Harry).
  const kongPuedeCopiarBribon = bribonUsado && !bribonDeEste && (!registroKongBribon || !kongBribonDeOtro);
  const kongPuedeCopiarHarry = harryUsado && !harryDeEste && !esKongYaRegistradoCon('Harry');
  const kongHabilitado = kongPuedeCopiarBribon || kongPuedeCopiarHarry;

  // Con una sola carta por jugador, quien ya registró su carta como Skull King, Kong o Davy Jones no tiene otra para una habilidad.
  const ev = jugadorActual.eventosBono;
  const cartaPropiaUsada =
    cartasPorJugadorEnRonda <= 1 &&
    ['pirata_por_sk', 'sk_por_sirena', 'kong_por_sk_sirena', 'monstruo_davy'].some((id) => (Number(ev[id]) || 0) > 0);
  const sinCartas = cartaPropiaUsada || (!hayCartaLibreHabilidad && !hayCartaLibreKong);

  const habilitada: Record<HabId, boolean> = {
    bribon_rotan: !bribonDeOtro && hayCartaLibreHabilidad,
    harry_gigante: !harryUsado && hayCartaLibreHabilidad,
    kong: kongActivo && kongHabilitado && hayCartaLibreKong,
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

  const [harrySel, setHarrySel] = useState<Record<number, 1 | -1>>({});
  const botonesHarry = (copia: boolean) => {
    const elegir = (delta: 1 | -1) => {
      vibrar();
      setHarrySel((a) => ({ ...a, [jugadorSeleccionadoIdx]: delta }));
      if (copia) aplicarKongHarryGigante(jugadorSeleccionadoIdx, delta);
      else aplicarHarryGigante(jugadorSeleccionadoIdx, delta);
    };
    const sel = harrySel[jugadorSeleccionadoIdx];
    return (
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          aria-pressed={sel === -1}
          onClick={() => elegir(-1)}
          className={`min-h-12 rounded-xl border-2 border-red-500 bg-red-50 py-3 text-base font-semibold text-red-800 ${
            sel === -1 ? 'ring-4 ring-red-300' : ''
          }`}
        >
          −1 al envite
        </button>
        <button
          type="button"
          aria-pressed={sel === 1}
          onClick={() => elegir(1)}
          className={`min-h-12 rounded-xl border-2 border-emerald-500 bg-emerald-50 py-3 text-base font-semibold text-emerald-800 ${
            sel === 1 ? 'ring-4 ring-emerald-300' : ''
          }`}
        >
          +1 al envite
        </button>
      </div>
    );
  };

  return (
    <Seccion
      numero={numero}
      titulo="Habilidades de piratas"
      marcador={`${registroHabilidadesRonda.length}/${maxHabilidadesRonda}`}
      abierto={abierto}
      onToggle={onToggle}
    >
      {habilidadesBloqueadasPorLimite || sinCartas ? (
        <p className="py-1 text-center text-base text-slate-500">
          {habilidadesBloqueadasPorLimite ? `Límite de ${maxHabilidadesRonda} habilidades por ronda.` : 'No quedan cartas disponibles para una habilidad.'}
        </p>
      ) : (
        <>
          <span className="text-left text-lg font-bold text-tinta">
            Habilidad pirata de <span className="text-azul">{nombre}</span>
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
                  <span className="block text-sm font-semibold text-slate-500">
                    Otro jugador tiene que haber usado Bribón o Harry
                  </span>
                )}
              </Opcion>
            )}
          </div>

          {habilidadEfectiva === 'bribon_rotan' && (
            <div className="flex flex-col gap-2 text-left">
              <span className="text-sm font-semibold uppercase text-slate-500">
                Puntos en juego (+ si cumple, − si falla)
              </span>
              <TogglesBribon
                etiqueta={`Apuesta de puntos de ${nombre}`}
                valor={ptsBribon}
                deshabilitado={bribonDeOtro}
                onElegir={(pts) => elegirPuntosBribon(jugadorSeleccionadoIdx, pts)}
              />
              {bribonDeOtro && (
                <span className="text-sm font-semibold text-azul">
                  El Bribón de Roatán ya lo usó {registroBribon?.jugadorNombre} en esta ronda.
                </span>
              )}
            </div>
          )}

          {habilidadEfectiva === 'harry_gigante' && (
            <div className="flex flex-col gap-2 text-left">
              <span className="text-base text-slate-700">
                Modifica el envite de <strong className="text-tinta">{nombre}</strong> (hoy: {jugadorActual.apuesta}):
              </span>
              {botonesHarry(false)}
            </div>
          )}

          {kongActivo && habilidadEfectiva === 'kong' && (
            <div className="flex flex-col gap-2.5 text-left">
              <span className="text-sm font-semibold uppercase text-slate-500">Kong copia la habilidad de:</span>
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
                    <span className="text-sm font-semibold text-azul">
                      Kong ya copió al Bribón con {registroKongBribon?.jugadorNombre} en esta ronda.
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="text-base text-slate-700">
                    Modifica el envite de <strong className="text-tinta">{nombre}</strong> con la copia de Harry:
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
          <span className="text-sm font-semibold uppercase text-slate-500">Habilidades en esta ronda</span>
          {registroHabilidadesRonda.map((h, idx) => (
            <div
              key={h.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-base"
            >
              <div className="flex flex-col text-left">
                <span className="font-semibold text-azul">
                  {h.etiqueta} <span className="text-sm text-slate-500">({h.jugadorNombre})</span>
                </span>
                <span className="mt-0.5 text-sm text-slate-500">{h.detalle}</span>
              </div>
              <button
                type="button"
                onClick={() => eliminarRegistroHabilidad(idx)}
                aria-label={`Quitar ${h.etiqueta}`}
                className="min-h-10 min-w-10 rounded bg-slate-100 px-2 py-1 text-base font-semibold text-red-700"
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
