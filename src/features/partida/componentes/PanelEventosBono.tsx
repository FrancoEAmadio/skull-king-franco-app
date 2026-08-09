import { useState } from 'react';
import { useApp } from '../../../estado/AppProvider';
import type { EventoBono } from '../../../tipos';

interface Props {
  eventosBase: EventoBono[];
  eventosExpansion: EventoBono[];
  sinBonosNormales: boolean;
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

  const [abierto, setAbierto] = useState(true);

  if (!jugadorActual) return null;

  const tieneEventos = Object.values(jugadorActual.eventosBono).some((v) => Number(v) > 0);

  return (
    <div
      className={`p-3 rounded-2xl transition-all ${
        sinBonosNormales
          ? 'bg-red-950/30 border border-red-800/80'
          : 'tarjeta-marron'
      }`}
    >
      <div
        className="flex justify-between items-center cursor-pointer select-none"
        onClick={() => setAbierto(!abierto)}
      >
        <div className="flex items-center gap-2">
          <label className="block text-xs uppercase tracking-wider text-amber-300 font-bold cursor-pointer">
            Eventos de Baza
          </label>
          {sinBonosNormales && (
            <span className="text-xs font-bold text-red-400">⚠️ Sin bonos normales</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {abierto && tieneEventos && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                limpiarTodosLosEventos();
              }}
              className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 font-bold"
            >
              🧹 Limpiar
            </button>
          )}
          <span className="text-amber-400 font-bold text-base px-1">
            {abierto ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {abierto && (
        <div className="flex flex-col gap-3 mt-3 pt-3 border-t border-slate-800/80">
          <div className="flex flex-col gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-amber-300 font-bold uppercase">Juego Base / Avanzado:</span>
            {eventosBase.map((evento) => (
              <FilaEvento
                key={evento.id}
                evento={evento}
                cantidad={obtenerCantidadBono(evento.id)}
                maximo={obtenerMaximoBono(evento.id)}
                onCambiar={(delta) => cambiarCantidadBono(evento.id, delta)}
                onBorrar={() => borrarBonoInmediato(evento.id)}
              />
            ))}
          </div>

          {eventosExpansion.length > 0 && (
            <div className="flex flex-col gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-purple-900/40">
              <span className="text-[10px] text-purple-300 font-bold uppercase">Expansión:</span>
              {eventosExpansion.map((evento) => (
                <FilaEvento
                  key={evento.id}
                  evento={evento}
                  cantidad={obtenerCantidadBono(evento.id)}
                  maximo={obtenerMaximoBono(evento.id)}
                  onCambiar={(delta) => cambiarCantidadBono(evento.id, delta)}
                  onBorrar={() => borrarBonoInmediato(evento.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface FilaEventoProps {
  evento: EventoBono;
  cantidad: number;
  maximo: number;
  onCambiar: (delta: number) => void;
  onBorrar: () => void;
}

function FilaEvento({ evento, cantidad, maximo, onCambiar, onBorrar }: FilaEventoProps) {
  const enMaximo = cantidad >= maximo;
  const puntosTexto = evento.puntos > 0 ? `+${evento.puntos}` : `${evento.puntos}`;

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-[11px] text-slate-200 font-semibold truncate">{evento.etiqueta}</span>
        <span className="text-[9px] text-slate-500">
          {puntosTexto} pts c/u · máx {maximo}
        </span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {cantidad > 0 && (
          <button
            type="button"
            onClick={onBorrar}
            className="text-[10px] text-red-400 hover:text-red-300 font-bold px-1.5 py-0.5 rounded bg-slate-800"
            title="Borrar"
          >
            ✕
          </button>
        )}
        <button
          type="button"
          onClick={() => onCambiar(-1)}
          disabled={cantidad <= 0}
          className="w-7 h-7 btn-marron-oscuro rounded-lg font-bold text-sm disabled:opacity-20"
        >
          -
        </button>
        <span className="w-6 text-center text-base font-black text-amber-300">{cantidad}</span>
        <button
          type="button"
          onClick={() => onCambiar(1)}
          disabled={enMaximo}
          className="w-7 h-7 btn-blanco-marron rounded-lg font-bold text-sm text-black disabled:opacity-20"
        >
          +
        </button>
      </div>
    </div>
  );
}
