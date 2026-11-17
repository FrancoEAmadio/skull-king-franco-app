import { useEffect, useRef, useState } from 'react';
import { useApp } from '../../../estado/AppProvider';
import { LISTA_EVENTOS_BONO } from '../../../datos/cartasDatos';
import {
  esEventoBonoBase,
  estaDisponibleEventoBono,
  estaReglaActiva,
} from '../../../dominio/disponibilidadContenido';
import { BarraJugadores } from '../componentes/BarraJugadores';
import { useGestosMultiDedo } from '../../../ui/useGestosMultiDedo';
import { vibrar } from '../../../infra/vibracion';
import { FichasNumero } from '../../../ui/FichasNumero';
import { ModalConfirmacion } from '../../../ui/ModalConfirmacion';
import { ChipBono } from '../../../ui/ChipBono';
import { Seccion } from '../../../ui/Seccion';
import { PanelAlianzasBotin } from '../componentes/PanelAlianzasBotin';
import { PanelEventosBono } from '../componentes/PanelEventosBono';
import { PanelHabilidades } from '../componentes/PanelHabilidades';

/**
 * Hoja de puntos de la ronda: por cada jugador se carga cuántas bazas ganó y, si acertó su envite,
 * se habilitan los bonos. Reemplaza a los antiguos pasos "Bazas" y "Bonos".
 */
export function PasoPuntos() {
  const { partida } = useApp();
  const {
    jugadoresOrdenados,
    jugadorSeleccionadoIdx,
    setJugadorSeleccionadoIdx,
    jugadorActual,
    indiceVisualActual,
    configuracionMesa,
    cartasPorJugadorEnRonda,
    totalGanadasAsignadas,
    elegirGanadas,
    maxGanadasPara,
    limpiarBazasRonda,
    limiteComodines,
    fijarCartasBlancas,
    puntajeProyectadoActual,
    puntajeProyectadoDe,
    textoBotonAvanzar,
    guardarJugadorYContinuar,
  } = partida;

  const [habilidadesAbiertas, setHabilidadesAbiertas] = useState(false);
  const [confirmarBazas, setConfirmarBazas] = useState(false);

  // Dirección del último cambio de jugador, para animar la entrada del panel (viene de la derecha o de la izquierda).
  const previoRef = useRef(indiceVisualActual);
  const montadoRef = useRef(false);
  const animacion = !montadoRef.current
    ? 'entra-subiendo'
    : indiceVisualActual >= previoRef.current
      ? 'entra-derecha'
      : 'entra-izquierda';
  useEffect(() => {
    previoRef.current = indiceVisualActual;
    montadoRef.current = true;
  }, [indiceVisualActual]);

  const total = jugadoresOrdenados.length;
  const inicioPanelRef = useRef<HTMLDivElement | null>(null);
  const gestos = useGestosMultiDedo({
    dos: (dir) => irA(Math.max(0, Math.min(total - 1, indiceVisualActual + dir))),
  });
  const irA = (posicion: number) => {
    const destino = jugadoresOrdenados[posicion];
    if (!destino) return;
    vibrar();
    setJugadorSeleccionadoIdx(destino.originalIndex);
    inicioPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!jugadorActual) return null;

  const esFantasma = Boolean(jugadorActual.fantasma);
  const esUltimo = indiceVisualActual === total - 1;
  const siguiente = jugadoresOrdenados[indiceVisualActual + 1]?.jugador;
  const acerto = Boolean(jugadorActual.fantasma) || jugadorActual.ganadas === jugadorActual.apuesta;
  const bazasSinAsignar = cartasPorJugadorEnRonda - totalGanadasAsignadas;
  // Una baza solo puede quedar sin ganador con el Kraken o la Ballena (reglas avanzadas o expansión).
  // En el juego base siempre hay ganador: si todas son Huidas, gana la primera que se jugó.
  const puedeHaberBazaDestruida = configuracionMesa.modoContenido !== 'base' && bazasSinAsignar === 1;

  // Si el envite no se cumplió, los bonos no se cobran (salvo que la mesa tenga activada esa regla).
  const sinBazas = jugadorActual.ganadas === 0;
  const bonosBloqueados = (!acerto && !configuracionMesa.cobrarBonosSinAcierto);

  const eventosDisponibles = LISTA_EVENTOS_BONO.filter(
    (evento) => evento.id !== 'alianza_botin' && estaDisponibleEventoBono(evento.id, configuracionMesa)
  );
  const eventosBase = eventosDisponibles.filter((evento) => esEventoBonoBase(evento.id));
  const eventosExpansion = eventosDisponibles.filter((evento) => !esEventoBonoBase(evento.id));

  const avanzar = () => {
    if (esUltimo) {
      if (bazasSinAsignar > 0) {
        setConfirmarBazas(true);
        return;
      }
      guardarJugadorYContinuar();
      return;
    }
    irA(indiceVisualActual + 1);
  };

  let n = 1;
  const numeroBazas = n++;
  const numeroHabilidades = configuracionMesa.usarHabilidadesPiratas && !esFantasma ? n++ : undefined;
  const numeroBonos = n++;
  const numeroAlianzas = estaReglaActiva(configuracionMesa, 'botin') ? n++ : undefined;
  const numeroComodines = configuracionMesa.usarComodinesBonificacion && !esFantasma ? n++ : undefined;

  return (
    <section className="flex flex-1 flex-col gap-4" {...gestos}>
      <div ref={inicioPanelRef} aria-hidden="true" className="-mb-4 h-0" />
      <BarraJugadores
        indice={indiceVisualActual}
        onIr={irA}
        items={jugadoresOrdenados.map(({ jugador, originalIndex }) => ({
          id: jugador.permanenteId,
          nombre: jugador.nombre,
          detalle: `${jugador.ganadas}/${jugador.apuesta}`,
          proyeccion: puntajeProyectadoDe(originalIndex),
        }))}
      />

      <div key={jugadorSeleccionadoIdx} className={`flex flex-col gap-4 ${animacion}`}>
        <div className="tarjeta flex items-end justify-between gap-3 p-4">
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {indiceVisualActual + 1} de {total}
            </span>
            <h3 className="truncate text-xl font-bold text-azul">{jugadorActual.nombre}</h3>
            {esFantasma && <span className="block text-[11px] font-semibold text-slate-500">No envida: no suma ni resta por el envite</span>}
            <span className="block text-xs font-semibold text-slate-500">
              Total: <strong className="text-tinta">{jugadorActual.puntos}</strong> pts
            </span>
          </div>
          <div className="shrink-0 text-right">
            <span className={`block text-3xl font-bold leading-none ${puntajeProyectadoActual >= 0 ? 'text-emerald-600' : 'text-rojo-osc'}`}>
              {puntajeProyectadoActual >= 0 ? '+' : ''}
              {puntajeProyectadoActual}
            </span>
            <span className="text-[10px] font-semibold uppercase text-slate-400">esta ronda</span>
          </div>
        </div>

        <Seccion numero={numeroBazas} titulo="Bazas ganadas" marcador={esFantasma ? undefined : `Envite ${jugadorActual.apuesta}`}>
          <div className="flex items-center justify-between gap-2">
            {esFantasma ? <span /> : <span
              className={`rounded-full border px-3 py-1 text-xs font-bold ${
                acerto ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-red-300 bg-red-50 text-red-700'
              }`}
            >
              {acerto ? 'Acertó' : 'No acertó'}
            </span>}
            <span className="text-xs font-semibold text-slate-500">
              {bazasSinAsignar > 0 ? `Faltan asignar ${bazasSinAsignar}` : 'Todas asignadas'}
            </span>
          </div>

          <FichasNumero
            etiqueta={`Bazas de ${jugadorActual.nombre}`}
            valor={jugadorActual.ganadas}
            max={cartasPorJugadorEnRonda}
            meta={esFantasma ? null : jugadorActual.apuesta}
            resultado={esFantasma ? null : acerto ? 'ok' : 'mal'}
            deshabilitada={(numero) => numero > maxGanadasPara(jugadorSeleccionadoIdx)}
            onElegir={(numero) => elegirGanadas(jugadorSeleccionadoIdx, numero)}
          />

          <button type="button" onClick={limpiarBazasRonda} className="btn-claro mx-auto px-5 py-2.5 text-sm">
            Limpiar bazas
          </button>
        </Seccion>

        {numeroHabilidades !== undefined && (
          <PanelHabilidades
            numero={numeroHabilidades}
            abierto={habilidadesAbiertas}
            onToggle={() => setHabilidadesAbiertas(!habilidadesAbiertas)}
          />
        )}

        <div className="entra-subiendo">
          <PanelEventosBono
            numero={numeroBonos}
            eventosBase={eventosBase}
            eventosExpansion={eventosExpansion}
            sinBazas={sinBazas}
            noSeCobran={bonosBloqueados}
          />
        </div>

        {numeroAlianzas !== undefined && <PanelAlianzasBotin numero={numeroAlianzas} />}

        {numeroComodines !== undefined && (
          <Seccion numero={numeroComodines} titulo="Comodines de bonificación">
            <ChipBono
              nombre="Comodín"
              detalle={`En mesa: ${limiteComodines.comodinesDisponibles} / ${limiteComodines.maxComodinesPermitidos}`}
              cantidad={jugadorActual.cartasBlancas || 0}
              maximo={limiteComodines.comodinesDisponibles}
              motivoTope="Ya están todos los comodines del mazo repartidos."
              onMas={() => fijarCartasBlancas(jugadorSeleccionadoIdx, (jugadorActual.cartasBlancas || 0) + 1)}
              onBorrar={() => fijarCartasBlancas(jugadorSeleccionadoIdx, 0)}
            />
          </Seccion>
        )}
      </div>

      <div className="barra-inferior mt-auto grid grid-cols-[auto_1fr] gap-2">
        <button type="button" onClick={() => irA(indiceVisualActual - 1)} disabled={indiceVisualActual === 0} className="btn-fantasma px-4 py-3.5 text-sm">
          ← Anterior
        </button>
        <button type="button" onClick={avanzar} className="btn-dorado py-3.5 text-base">
          {esUltimo ? textoBotonAvanzar : `Siguiente: ${siguiente?.nombre ?? ''} →`}
        </button>
      </div>

      <ModalConfirmacion
        abierto={confirmarBazas}
        titulo={puedeHaberBazaDestruida ? 'Hay una baza sin ganador' : 'Faltan bazas por asignar'}
        descripcion={
          puedeHaberBazaDestruida ? (
            <div className="flex items-center gap-3">
              <img
                src={`${import.meta.env.BASE_URL}archivos/cartas/kraken.webp`}
                alt="Carta del Kraken"
                draggable={false}
                className="h-24 w-auto shrink-0 rounded-lg shadow"
              />
              <div>
                En esta ronda se juegan {cartasPorJugadorEnRonda} baza{cartasPorJugadorEnRonda === 1 ? '' : 's'} y se asignaron {totalGanadasAsignadas}.
                <span className="mt-2 block text-sm font-medium text-slate-600">
                  Una baza queda sin ganador si el último monstruo jugado fue el Kraken, o si la Ballena Blanca o la Mantarraya quedaron sin ninguna carta que pueda ganar (si hay una Huida, la gana la primera Huida jugada). ¿Pasó eso?
                </span>
              </div>
            </div>
          ) : (
            <>
              En esta ronda se juegan {cartasPorJugadorEnRonda} baza{cartasPorJugadorEnRonda === 1 ? '' : 's'} y se asignaron {totalGanadasAsignadas}: faltan {bazasSinAsignar}.
              <span className="mt-2 block text-sm font-medium text-slate-600">
                {configuracionMesa.modoContenido === 'base'
                  ? 'En el juego base todas las bazas tienen ganador (si todas son Huidas, gana la primera que se jugó), así que seguramente falta anotar alguna.'
                  : 'Como máximo una baza puede quedar sin ganador, así que seguramente falta anotar alguna.'}
              </span>
            </>
          )
        }
        textoConfirmar={puedeHaberBazaDestruida ? 'Sí, el Kraken la destruyó' : 'Ver resumen igual'}
        textoCancelar="No, corregir bazas"
        onCancelar={() => setConfirmarBazas(false)}
        onConfirmar={() => {
          setConfirmarBazas(false);
          guardarJugadorYContinuar();
        }}
      />
    </section>
  );
}
