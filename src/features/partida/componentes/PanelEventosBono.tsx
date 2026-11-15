import { useApp } from '../../../estado/AppProvider';
import { StepperBono } from '../../../ui/StepperBono';
import { Seccion } from '../../../ui/Seccion';
import { vibrar } from '../../../infra/vibracion';
import type { EventoBono } from '../../../tipos';

interface Props {
  numero?: number;
  eventosBase: EventoBono[];
  eventosExpansion: EventoBono[];
}

const REEMPLAZADOS = new Set(['catorce_negro', 'catorce_color', 'ocho_expansion', 'siete_expansion', 'puntos_cartas']);

function nombreCorto(etiqueta: string): string {
  return etiqueta.replace(/\s*\(.*?\)\s*$/, '').trim();
}

function detalleBono(evento: EventoBono, maximo: number): string {
  const signo = evento.puntos > 0 ? '+' : '';
  return `${signo}${evento.puntos} pts · máx ${maximo}`;
}

export function PanelEventosBono({ numero, eventosBase, eventosExpansion }: Props) {
  const { partida } = useApp();
  const {
    jugadorActual,
    obtenerCantidadBono,
    obtenerMaximoBono,
    ajustarPuntosCartas,
    limitePuntosCartas,
    cambiarCantidadBono,
    limpiarTodosLosEventos,
    motivoTopeBono,
  } = partida;

  if (!jugadorActual) return null;

  const tieneEventos = Object.values(jugadorActual.eventosBono).some((v) => Number(v) !== 0);
  const unidadesCartas = Number(jugadorActual.eventosBono.puntos_cartas) || 0;
  const puntosCartas = unidadesCartas * 5;
  const enMaximo = unidadesCartas >= limitePuntosCartas.maximoUnidades;
  const enMinimo = unidadesCartas <= limitePuntosCartas.minimoUnidades;
  const base = eventosBase.filter((e) => !REEMPLAZADOS.has(e.id));
  const expansion = eventosExpansion.filter((e) => !REEMPLAZADOS.has(e.id));

  const grupo = (titulo: string, eventos: EventoBono[]) =>
    eventos.length > 0 && (
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{titulo}</span>
        {eventos.map((evento) => {
          const maximo = obtenerMaximoBono(evento.id);
          return (
            <StepperBono
              key={evento.id}
              nombre={nombreCorto(evento.etiqueta)}
              detalle={detalleBono(evento, maximo)}
              cantidad={obtenerCantidadBono(evento.id)}
              maximo={maximo}
              motivoTope={motivoTopeBono(evento.id)}
              onMas={() => cambiarCantidadBono(evento.id, 1)}
              onMenos={() => cambiarCantidadBono(evento.id, -1)}
            />
          );
        })}
      </div>
    );

  return (
    <Seccion numero={numero} titulo="Bonos de la ronda">
      {tieneEventos && (
        <button type="button" onClick={limpiarTodosLosEventos} className="btn-claro self-end px-3 py-2 text-xs">
          🧹 Limpiar bonos
        </button>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Cartas de palo</span>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="block text-sm font-extrabold leading-tight text-tinta">Puntos por cartas capturadas</span>
              <span className="block text-xs font-semibold text-slate-500">
                {enMaximo ? `Máximo: ${limitePuntosCartas.maximoUnidades * 5} pts` : '14, 8 y 7 · de a 5 pts'}
              </span>
            </div>
            <div className="stepper" role="group" aria-label="Puntos por cartas capturadas">
              <button
                type="button"
                className="stepper-btn"
                disabled={enMinimo}
                aria-label="Restar 5 puntos"
                onClick={() => {
                  vibrar();
                  ajustarPuntosCartas(-1);
                }}
              >
                −
              </button>
              <span className="stepper-valor !min-w-[3.2rem] !text-lg" aria-live="polite">
                {puntosCartas > 0 ? '+' : ''}
                {puntosCartas}
              </span>
              <button
                type="button"
                className="stepper-btn"
                disabled={enMaximo}
                aria-label="Sumar 5 puntos"
                onClick={() => {
                  vibrar();
                  ajustarPuntosCartas(1);
                }}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {grupo('Capturas especiales', base)}
      {grupo('Expansión', expansion)}
    </Seccion>
  );
}
