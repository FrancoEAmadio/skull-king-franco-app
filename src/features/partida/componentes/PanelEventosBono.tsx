import { useState } from 'react';
import { ContadorMasMenos } from '../../../ui/ContadorMasMenos';
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

  const [abierto, setAbierto] = useState(false);

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
              className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 font-bold"
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
        <div className="flex flex-col gap-3 mt-2 pt-2 border-t border-slate-800/80">
          {eventosBase.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-slate-400 font-bold uppercase">Juego Base / Avanzado</span>
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
          )}

          {eventosExpansion.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-purple-400/70 font-bold uppercase">Expansión</span>
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
  const estaEnCero = cantidad === 0;
  const colorTexto = estaEnCero ? 'text-slate-400' : 'text-slate-200';

  return (
    <div className={`flex items-center justify-between gap-3 py-1.5 ${estaEnCero ? 'opacity-60' : ''}`}>
      <div className="flex flex-col flex-1 min-w-0">
        <span className={`text-[11px] font-semibold truncate ${colorTexto}`}>
          {evento.etiqueta}{' '}
          <span className="text-[11px] text-amber-400 font-bold">
            +{evento.puntos} pts · máx {maximo}
          </span>
        </span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {cantidad > 0 && (
          <button
            type="button"
            onClick={onBorrar}
            className="text-[11px] text-red-400 hover:text-red-300 font-bold px-1.5 py-0.5 rounded bg-slate-800"
            title="Borrar"
          >
            ✕
          </button>
        )}
        <ContadorMasMenos
          valor={cantidad}
          onDecrementar={() => onCambiar(-1)}
          onIncrementar={() => onCambiar(1)}
          decrementarDisabled={cantidad <= 0}
          incrementarDisabled={enMaximo}
          colorValor={estaEnCero ? 'text-slate-400' : 'text-amber-300'}
          tamanoBoton="sm"
          resaltar={!estaEnCero}
        />
      </div>
    </div>
  );
}
