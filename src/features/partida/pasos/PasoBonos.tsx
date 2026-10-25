import { useState } from 'react';
import { useApp } from '../../../estado/AppProvider';
import { useSwipeHorizontal } from '../../../ui/useSwipeHorizontal';
import { LISTA_EVENTOS_BONO } from '../../../datos/cartasDatos';
import {
  esEventoBonoBase,
  estaDisponibleEventoBono,
  estaReglaActiva,
} from '../../../dominio/disponibilidadContenido';
import { PanelHabilidades } from '../componentes/PanelHabilidades';
import { PanelEventosBono } from '../componentes/PanelEventosBono';
import { PanelAlianzasBotin } from '../componentes/PanelAlianzasBotin';
import { CarruselJugadores } from '../../../ui/CarruselJugadores';
import { PildoraBono } from '../../../ui/PildoraBono';

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
    fijarCartasBlancas,
    puntajeProyectadoActual,
    textoBotonAvanzar,
    guardarJugadorYContinuar,
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

  const eventosDisponibles = LISTA_EVENTOS_BONO.filter(
    (evento) =>
      evento.id !== 'alianza_botin' &&
      estaDisponibleEventoBono(evento.id, configuracionMesa)
  );
  const eventosBase = eventosDisponibles.filter((evento) => esEventoBonoBase(evento.id));
  const eventosExpansion = eventosDisponibles.filter((evento) => !esEventoBonoBase(evento.id));

  const sinBonosNormales =
    jugadorActual.apuesta !== jugadorActual.ganadas &&
    !configuracionMesa.cobrarBonosSinAcierto &&
    !configuracionMesa.usarModoBribon;

  return (
    <section
      onTouchStart={iniciarTouch}
      onTouchEnd={finalizarTouch}
      className="flex h-full select-none flex-col"
    >
      <div className="tarjeta-marron overflow-clip">
        <CarruselJugadores
          variante="pestanas"
          seleccionado={jugadorSeleccionadoIdx}
          onSeleccionar={setJugadorSeleccionadoIdx}
          items={jugadoresOrdenados.map(({ jugador, originalIndex }) => ({
            indice: originalIndex,
            id: jugador.permanenteId,
            nombre: jugador.nombre,
            detalle: `${jugador.ganadas}/${jugador.apuesta}`,
          }))}
        />

        <div className="flex items-center justify-between border-b border-slate-800 p-4">
          <div>
            <span className="block text-sm font-bold uppercase text-slate-400">Puntos totales</span>
            <span className="text-3xl font-black leading-none text-white">
              {jugadorActual.puntos} <span className="text-base font-bold text-amber-300">pts</span>
            </span>
          </div>
          <div className="text-right">
            <span className="block text-sm font-bold uppercase text-slate-400">Esta ronda</span>
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-xl font-black ${
                puntajeProyectadoActual >= 0
                  ? 'border border-emerald-800 bg-emerald-950/60 text-emerald-300'
                  : 'border border-red-800 bg-red-950/60 text-red-300'
              }`}
            >
              {puntajeProyectadoActual >= 0 ? '+' : ''}
              {puntajeProyectadoActual} pts
            </span>
          </div>
        </div>

        <div className="flex flex-col divide-y divide-slate-800">
          {configuracionMesa.usarComodinesBonificacion && (
            <div className="flex flex-col gap-2 p-3">
              <span className="block text-sm font-bold uppercase tracking-widest text-amber-300">
                🃏 Comodines de bonificación
              </span>
              <PildoraBono
                nombre="Comodín"
                detalle={`En mesa: ${limiteComodines.comodinesDisponibles} / ${limiteComodines.maxComodinesPermitidos}`}
                cantidad={jugadorActual.cartasBlancas || 0}
                maximo={limiteComodines.comodinesBloqueados ? 0 : 1}
                onTocar={() =>
                  limiteComodines.comodinesBloqueados
                    ? fijarCartasBlancas(jugadorSeleccionadoIdx, 0)
                    : fijarCartasBlancas(jugadorSeleccionadoIdx, (jugadorActual.cartasBlancas || 0) + 1)
                }
              />
            </div>
          )}

          {configuracionMesa.usarHabilidadesPiratas && (
            <PanelHabilidades
              abierto={acordeonHabilidadesAbierto}
              onToggle={() => setAcordeonHabilidadesAbierto(!acordeonHabilidadesAbierto)}
            />
          )}

          <PanelEventosBono
            eventosBase={eventosBase}
            eventosExpansion={eventosExpansion}
            sinBonosNormales={sinBonosNormales}
          />

          {estaReglaActiva(configuracionMesa, 'botin') && <PanelAlianzasBotin />}
        </div>
      </div>

      <div className="flex flex-col pt-3">
        <button
          onClick={guardarJugadorYContinuar}
          className="w-full mt-1 py-4 btn-blanco-marron text-xl rounded-2xl shadow-lg font-black"
        >
          {textoBotonAvanzar}
        </button>
      </div>
    </section>
  );
}
