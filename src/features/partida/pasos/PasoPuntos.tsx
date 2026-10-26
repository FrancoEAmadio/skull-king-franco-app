import { useEffect, useRef, useState } from 'react';
import { useApp } from '../../../estado/AppProvider';
import { useSwipeHorizontal } from '../../../ui/useSwipeHorizontal';
import { LISTA_EVENTOS_BONO } from '../../../datos/cartasDatos';
import {
  esEventoBonoBase,
  estaDisponibleEventoBono,
  estaReglaActiva,
} from '../../../dominio/disponibilidadContenido';
import { CarruselJugadores } from '../../../ui/CarruselJugadores';
import { FichasNumero } from '../../../ui/FichasNumero';
import { ModalConfirmacion } from '../../../ui/ModalConfirmacion';
import { PildoraBono } from '../../../ui/PildoraBono';
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
  const irA = (posicion: number) => {
    const destino = jugadoresOrdenados[posicion];
    if (!destino) return;
    setJugadorSeleccionadoIdx(destino.originalIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { iniciarTouch, finalizarTouch } = useSwipeHorizontal({
    onSwipeIzquierda: () => indiceVisualActual < total - 1 && irA(indiceVisualActual + 1),
    onSwipeDerecha: () => indiceVisualActual > 0 && irA(indiceVisualActual - 1),
  });

  if (!jugadorActual) return null;

  const esUltimo = indiceVisualActual === total - 1;
  const siguiente = jugadoresOrdenados[indiceVisualActual + 1]?.jugador;
  const acerto = jugadorActual.ganadas === jugadorActual.apuesta;
  const bazasSinAsignar = cartasPorJugadorEnRonda - totalGanadasAsignadas;

  // Si el envite no se cumplió, los bonos no se cobran (salvo que la mesa tenga activada esa regla).
  const bonosBloqueados = !acerto && !configuracionMesa.cobrarBonosSinAcierto;

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
  const numeroHabilidades = configuracionMesa.usarHabilidadesPiratas ? n++ : undefined;
  const numeroBonos = n++;
  const numeroAlianzas = estaReglaActiva(configuracionMesa, 'botin') ? n++ : undefined;
  const numeroComodines = configuracionMesa.usarComodinesBonificacion ? n++ : undefined;

  return (
    <section onTouchStart={iniciarTouch} onTouchEnd={finalizarTouch} className="flex flex-1 flex-col gap-3">
      <CarruselJugadores
        seleccionado={jugadorSeleccionadoIdx}
        onSeleccionar={setJugadorSeleccionadoIdx}
        items={jugadoresOrdenados.map(({ jugador, originalIndex }) => ({
          indice: originalIndex,
          id: jugador.permanenteId,
          nombre: jugador.nombre,
          detalle: `${jugador.ganadas}/${jugador.apuesta}`,
        }))}
      />

      <div key={jugadorSeleccionadoIdx} className={`flex flex-col gap-3 ${animacion}`}>
        {/* Ficha del jugador */}
        <div className="tarjeta-marron tarjeta-acento flex items-end justify-between gap-3 p-4">
          <div className="min-w-0">
            <span className="block text-sm font-black uppercase tracking-widest text-slate-300">
              {indiceVisualActual + 1} de {total}
            </span>
            <h3 className="truncate text-3xl font-black uppercase leading-tight text-amber-300">
              {jugadorActual.nombre}
            </h3>
            <span className="block text-base font-semibold text-slate-300">
              Total: <strong className="text-white">{jugadorActual.puntos}</strong> pts
            </span>
          </div>
          <div className="shrink-0 text-right">
            <span
              className={`block text-4xl font-black leading-none ${
                puntajeProyectadoActual >= 0 ? 'text-emerald-300' : 'text-red-300'
              }`}
            >
              {puntajeProyectadoActual >= 0 ? '+' : ''}
              {puntajeProyectadoActual}
            </span>
            <span className="text-sm font-bold uppercase text-slate-300">esta ronda</span>
          </div>
        </div>

        {/* 1. Bazas ganadas */}
        <Seccion numero={numeroBazas} titulo="Bazas ganadas" marcador={`Envite ${jugadorActual.apuesta}`}>
          <div className="flex items-center justify-between gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-base font-black ${
                acerto
                  ? 'border-emerald-400/60 bg-emerald-950/60 text-emerald-300'
                  : 'border-red-400/60 bg-red-950/60 text-red-300'
              }`}
            >
              {acerto ? '✓ Acertó el envite' : '✕ No acertó'}
            </span>
            <span className="text-sm font-semibold text-slate-300">
              {bazasSinAsignar > 0
                ? `Quedan ${bazasSinAsignar} baza${bazasSinAsignar === 1 ? '' : 's'} por asignar en la mesa`
                : 'Todas las bazas asignadas'}
            </span>
          </div>

          <FichasNumero
            etiqueta={`Bazas de ${jugadorActual.nombre}`}
            valor={jugadorActual.ganadas}
            max={cartasPorJugadorEnRonda}
            meta={jugadorActual.apuesta}
            resultado={acerto ? 'ok' : 'mal'}
            deshabilitada={(numero) => numero > maxGanadasPara(jugadorSeleccionadoIdx)}
            onElegir={(numero) => elegirGanadas(jugadorSeleccionadoIdx, numero)}
          />

          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-slate-300">El aro punteado marca el envite.</span>
            <button
              type="button"
              onClick={limpiarBazasRonda}
              className="btn-marron-oscuro shrink-0 rounded-xl px-3 py-2 text-sm font-bold"
            >
              🔄 Limpiar bazas
            </button>
          </div>
        </Seccion>

        {/* 2. Habilidades (pueden cambiar el envite, por eso van antes de los bonos) */}
        {numeroHabilidades !== undefined && (
          <PanelHabilidades
            numero={numeroHabilidades}
            abierto={habilidadesAbiertas}
            onToggle={() => setHabilidadesAbiertas(!habilidadesAbiertas)}
          />
        )}

        {/* 3. Bonos: se habilitan al acertar el envite */}
        {bonosBloqueados ? (
          <Seccion numero={numeroBonos} titulo="Bonos de la ronda" marcador="🔒">
            <p className="text-left text-base font-semibold text-slate-200">
              Se habilitan cuando <strong className="text-white">{jugadorActual.nombre}</strong> acierta su envite
              (hoy ganó {jugadorActual.ganadas} y apostó {jugadorActual.apuesta}).
            </p>
          </Seccion>
        ) : (
          <div className="entra-subiendo">
            <PanelEventosBono numero={numeroBonos} eventosBase={eventosBase} eventosExpansion={eventosExpansion} />
          </div>
        )}

        {numeroAlianzas !== undefined && <PanelAlianzasBotin numero={numeroAlianzas} />}

        {numeroComodines !== undefined && (
          <Seccion numero={numeroComodines} titulo="Comodines de bonificación">
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
          </Seccion>
        )}
      </div>

      <div className="barra-inferior mt-auto grid grid-cols-[auto_1fr] gap-2">
        <button
          type="button"
          onClick={() => irA(indiceVisualActual - 1)}
          disabled={indiceVisualActual === 0}
          className="btn-marron-oscuro rounded-2xl px-4 py-3.5 text-base"
        >
          ← Anterior
        </button>
        <button type="button" onClick={avanzar} className="btn-blanco-marron rounded-2xl py-3.5 text-lg font-black">
          {esUltimo ? textoBotonAvanzar : `Siguiente: ${siguiente?.nombre ?? ''} ➔`}
        </button>
      </div>

      <ModalConfirmacion
        abierto={confirmarBazas}
        titulo="Faltan bazas por asignar"
        descripcion={`En esta ronda se juegan ${cartasPorJugadorEnRonda} baza${cartasPorJugadorEnRonda === 1 ? '' : 's'} y se asignaron ${totalGanadasAsignadas}. ¿Querés ver el resumen igual?`}
        textoConfirmar="Ver resumen"
        onCancelar={() => setConfirmarBazas(false)}
        onConfirmar={() => {
          setConfirmarBazas(false);
          guardarJugadorYContinuar();
        }}
      />
    </section>
  );
}
