import { useApp } from '../../../estado/AppProvider';
import { PildoraBono } from '../../../ui/PildoraBono';
import { vibrar } from '../../../infra/vibracion';
import type { EventoBono } from '../../../tipos';

interface Props {
  eventosBase: EventoBono[];
  eventosExpansion: EventoBono[];
  sinBonosNormales: boolean;
}

const REEMPLAZADOS = new Set(['catorce_negro', 'catorce_color', 'ocho_expansion', 'siete_expansion', 'puntos_cartas']);

function nombreCorto(etiqueta: string): string {
  return etiqueta.replace(/\s*\(.*?\)\s*$/, '').trim();
}

function detalleBono(evento: EventoBono, maximo: number): string {
  const signo = evento.puntos > 0 ? '+' : '';
  return `${signo}${evento.puntos} pts · máx ${maximo}`;
}

export function PanelEventosBono({ eventosBase, eventosExpansion, sinBonosNormales }: Props) {
  const { partida } = useApp();
  const {
    jugadorActual,
    obtenerCantidadBono,
    obtenerMaximoBono,
    ajustarPuntosCartas,
    limitePuntosCartas,
    cambiarCantidadBono,
    borrarBonoInmediato,
    limpiarTodosLosEventos,
  } = partida;

  if (!jugadorActual) return null;

  const tieneEventos = Object.values(jugadorActual.eventosBono).some((v) => Number(v) !== 0);
  const unidadesCartas = Number(jugadorActual.eventosBono.puntos_cartas) || 0;
  const puntosCartas = unidadesCartas * 5;
  const enMaximo = unidadesCartas >= limitePuntosCartas.maximoUnidades;
  const enMinimo = unidadesCartas <= limitePuntosCartas.minimoUnidades;
  const base = eventosBase.filter((e) => !REEMPLAZADOS.has(e.id));
  const expansion = eventosExpansion.filter((e) => !REEMPLAZADOS.has(e.id));

  const tocar = (evento: EventoBono) => {
    const cantidad = obtenerCantidadBono(evento.id);
    const maximo = obtenerMaximoBono(evento.id);
    if (cantidad >= maximo) borrarBonoInmediato(evento.id);
    else cambiarCantidadBono(evento.id, 1);
  };

  const grupo = (titulo: string, color: string, eventos: EventoBono[]) =>
    eventos.length > 0 && (
      <div className="flex flex-col gap-2">
        <span className={`text-sm font-bold uppercase tracking-widest ${color}`}>{titulo}</span>
        <div className="grid grid-cols-1 gap-2.5">
          {eventos.map((evento) => {
            const maximo = obtenerMaximoBono(evento.id);
            return (
              <PildoraBono
                key={evento.id}
                nombre={nombreCorto(evento.etiqueta)}
                detalle={detalleBono(evento, maximo)}
                cantidad={obtenerCantidadBono(evento.id)}
                maximo={maximo}
                onTocar={() => tocar(evento)}
              />
            );
          })}
        </div>
      </div>
    );

  return (
    <div
      className={`flex flex-col gap-3 p-3 ${
        sinBonosNormales ? 'bg-red-950/30' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <span className="block text-lg font-extrabold text-white">Bonos de la ronda</span>
          <span className="block text-sm font-semibold text-slate-400">Tocá para sumar; al llegar al máximo vuelve a 0.</span>
        </div>
        {tieneEventos && (
          <button
            type="button"
            onClick={limpiarTodosLosEventos}
            className="btn-marron-oscuro shrink-0 rounded-xl px-3 py-2.5 text-base font-bold"
          >
            🧹 Limpiar
          </button>
        )}
      </div>

      {sinBonosNormales && (
        <span className="rounded-xl bg-red-950/60 px-3 py-2 text-base font-bold text-red-300">
          ⚠️ Falló el envite: no se cobran bonos normales.
        </span>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-sm font-bold uppercase tracking-widest text-slate-300">Cartas de palo</span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              vibrar();
              ajustarPuntosCartas(1);
            }}
            disabled={enMaximo}
            aria-label={`Puntos por cartas capturadas: ${puntosCartas}. Tocá para sumar 5`}
            className={`pildora-bono pildora-tope col-span-2 w-full ${puntosCartas !== 0 ? 'pildora-bono-activa' : ''}`}
          >
            <span className="text-base font-extrabold leading-tight">Puntos por cartas capturadas</span>
            <span className={`text-sm font-bold ${puntosCartas !== 0 ? 'text-amber-950/80' : 'text-amber-300'}`}>
              {enMaximo ? `Máximo de la ronda: ${limitePuntosCartas.maximoUnidades * 5} pts` : '14, 8 y 7 · cada toque suma +5'}
            </span>
            <span className="pildora-contador !min-w-[3.4rem] px-2 text-base" aria-hidden="true">
              {puntosCartas > 0 ? '+' : ''}
              {puntosCartas}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              vibrar();
              ajustarPuntosCartas(-1);
            }}
            disabled={enMinimo}
            aria-label="Restar 5 puntos"
            className="btn-marron-oscuro min-h-12 rounded-2xl text-xl font-black"
          >
            −5
          </button>
          <button
            type="button"
            onClick={() => {
              vibrar();
              ajustarPuntosCartas(-puntosCartas / 5);
            }}
            disabled={puntosCartas === 0}
            aria-label="Borrar puntos por cartas capturadas"
            className="min-h-12 rounded-2xl border border-red-700 bg-red-950/70 text-xl font-black text-red-300 disabled:opacity-30"
          >
            ✕
          </button>
        </div>
      </div>

      {grupo('Capturas especiales', 'text-slate-300', base)}
      {grupo('Expansión', 'text-purple-300', expansion)}
    </div>
  );
}
