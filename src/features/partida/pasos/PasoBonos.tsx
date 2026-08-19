import { useState } from 'react';
import { useApp } from '../../../estado/AppProvider';
import { useSwipeHorizontal } from '../../../ui/useSwipeHorizontal';
import { LISTA_EVENTOS_BONO } from '../../../datos/cartasDatos';
import type { EventoBono } from '../../../tipos';
import { PanelHabilidades } from '../componentes/PanelHabilidades';
import { PanelEventosBono } from '../componentes/PanelEventosBono';
import { PanelAlianzasBotin } from '../componentes/PanelAlianzasBotin';

export function PasoBonos() {
  const { partida } = useApp();
  const {
    jugadoresOrdenados,
    jugadorSeleccionadoIdx,
    setJugadorSeleccionadoIdx,
    jugadorActual,
    indiceVisualActual,
    configuracionMesa,
    limiteComodines,
    cambiarCartasBlancas,
    puntajeProyectadoActual,
    textoBotonAvanzar,
    guardarJugadorYContinuar,
    volverAPasoBazas,
  } = partida;

  const [acordeonHabilidadesAbierto, setAcordeonHabilidadesAbierto] = useState(false);

  const irSiguiente = () => {
    if (indiceVisualActual < jugadoresOrdenados.length - 1) {
      const siguiente = jugadoresOrdenados[indiceVisualActual + 1]!;
      setJugadorSeleccionadoIdx(siguiente.originalIndex);
    }
  };

  const irAnterior = () => {
    if (indiceVisualActual > 0) {
      const anterior = jugadoresOrdenados[indiceVisualActual - 1]!;
      setJugadorSeleccionadoIdx(anterior.originalIndex);
    }
  };

  const { iniciarTouch, finalizarTouch } = useSwipeHorizontal({
    onSwipeIzquierda: irSiguiente,
    onSwipeDerecha: irAnterior,
  });

  if (!jugadorActual) return null;

  const eventosBase = LISTA_EVENTOS_BONO.filter(
    (e) => !['alianza_botin', 'kong_por_sk_sirena'].includes(e.id)
  );
  const eventosExpansion: EventoBono[] = [
    LISTA_EVENTOS_BONO.find((e) => e.id === 'kong_por_sk_sirena')!,
  ].filter(Boolean);

  const eventosBaseFiltrados = eventosBase.filter((e) => {
    if (e.id === 'siete_expansion' || e.id === 'ocho_expansion') {
      return configuracionMesa.modoContenido === 'expansion';
    }
    return true;
  });

  const eventosExpansionFiltrados =
    configuracionMesa.modoContenido === 'expansion' &&
    configuracionMesa.reglasOpcionales.primerOficialKong !== false
      ? eventosExpansion
      : [];

  const sinBonosNormales =
    jugadorActual.apuesta !== jugadorActual.ganadas &&
    !configuracionMesa.cobrarBonosSinAcierto &&
    !configuracionMesa.usarModoBribon;

  return (
    <section
      onTouchStart={iniciarTouch}
      onTouchEnd={finalizarTouch}
      className="flex flex-col h-full select-none"
    >
      <nav className="flex gap-2 overflow-x-auto pb-2 border-b border-amber-900/60 scroll-oculto">
        {jugadoresOrdenados.map(({ jugador, originalIndex }) => (
          <button
            key={originalIndex}
            onClick={() => setJugadorSeleccionadoIdx(originalIndex)}
            className={`px-4 py-2.5 rounded-xl font-bold whitespace-nowrap text-sm flex items-center gap-1.5 transition-all ${
              jugadorSeleccionadoIdx === originalIndex
                ? 'btn-blanco-marron shadow-lg scale-[1.02]'
                : 'btn-marron-oscuro opacity-70'
            }`}
          >
            <span>{jugador.nombre}</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-black/30">
              {jugador.ganadas}/{jugador.apuesta}
            </span>
          </button>
        ))}
      </nav>

      <div className="flex-1 overflow-y-auto flex flex-col gap-4 pt-3">
        <div className="tarjeta-marron p-4 flex justify-between items-center border-l-4 border-amber-500">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-black text-white">{jugadorActual.nombre}</h3>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                ({indiceVisualActual + 1} de {jugadoresOrdenados.length})
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Envite: {jugadorActual.apuesta} · Bazas ganadas: {jugadorActual.ganadas}
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-amber-300 block">{jugadorActual.puntos} pts</span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                puntajeProyectadoActual >= 0
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-red-950 text-red-400 border border-red-800'
              }`}
            >
              Ronda: {puntajeProyectadoActual >= 0 ? '+' : ''}
              {puntajeProyectadoActual} pts
            </span>
          </div>
        </div>

        {configuracionMesa.usarComodinesBonificacion && (
          <div className="p-3 bg-amber-950/40 border border-amber-700/50 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-amber-300 uppercase block">
                🃏 Comodines de Bonificación
              </span>
              <p className="text-xs text-slate-300">
                Disponibles mesa:{' '}
                <strong className="text-white">
                  {limiteComodines.comodinesDisponibles} / {limiteComodines.maxComodinesPermitidos}
                </strong>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => cambiarCartasBlancas(jugadorSeleccionadoIdx, -1)}
                disabled={!jugadorActual.cartasBlancas}
                className="w-8 h-8 btn-marron-oscuro rounded-lg font-bold disabled:opacity-20"
              >
                -
              </button>
              <span className="text-lg font-bold text-white px-1">
                {jugadorActual.cartasBlancas || 0}
              </span>
              <button
                onClick={() => cambiarCartasBlancas(jugadorSeleccionadoIdx, 1)}
                disabled={limiteComodines.comodinesBloqueados}
                className="w-8 h-8 btn-blanco-marron rounded-lg font-bold text-black disabled:opacity-20"
              >
                +
              </button>
            </div>
          </div>
        )}

        {configuracionMesa.usarHabilidadesPiratas && (
          <PanelHabilidades
            abierto={acordeonHabilidadesAbierto}
            onToggle={() => setAcordeonHabilidadesAbierto(!acordeonHabilidadesAbierto)}
          />
        )}

        <PanelEventosBono
          eventosBase={eventosBaseFiltrados}
          eventosExpansion={eventosExpansionFiltrados}
          sinBonosNormales={sinBonosNormales}
        />

        {configuracionMesa.modoContenido !== 'base' &&
          configuracionMesa.reglasOpcionales.botin !== false && <PanelAlianzasBotin />}

        <div className="mt-1 pt-2 pb-1 flex gap-2">
          <button
            onClick={volverAPasoBazas}
            className="w-1/3 py-4 btn-marron-oscuro text-sm rounded-2xl font-bold"
          >
            ← Bazas
          </button>
          <button
            onClick={guardarJugadorYContinuar}
            className="flex-1 py-4 btn-blanco-marron text-lg rounded-2xl shadow-lg font-black"
          >
            {textoBotonAvanzar}
          </button>
        </div>
      </div>
    </section>
  );
}
