import { useApp } from '../../../estado/AppProvider';
import { PildoraBono } from '../../../ui/PildoraBono';
import type { EventoBono } from '../../../tipos';

interface Props {
  eventosBase: EventoBono[];
  eventosExpansion: EventoBono[];
  sinBonosNormales: boolean;
}

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
    cambiarCantidadBono,
    borrarBonoInmediato,
    limpiarTodosLosEventos,
  } = partida;

  if (!jugadorActual) return null;

  const tieneEventos = Object.values(jugadorActual.eventosBono).some((v) => Number(v) > 0);

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
      className={`flex flex-col gap-4 rounded-2xl p-4 ${
        sinBonosNormales ? 'border border-red-700/80 bg-red-950/30' : 'tarjeta-marron'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <span className="block text-lg font-extrabold text-white">Bonos de la ronda</span>
          <span className="block text-sm font-semibold text-slate-300">
            Tocá para sumar. Al llegar al máximo, otro toque vuelve a 0.
          </span>
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

      {grupo('Juego base / avanzado', 'text-slate-300', eventosBase)}
      {grupo('Expansión', 'text-purple-300', eventosExpansion)}
    </div>
  );
}
