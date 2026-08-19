import { LISTA_EVENTOS_BONO } from '../datos/cartasDatos';
import type {
  AlianzaBotin,
  ConfiguracionMesa,
  DetalleBono,
  EntradaHistorialRonda,
  Jugador,
  RegistroHabilidad,
  ResumenRondaJugador,
} from '../tipos';
import { calcularBonosAlianzasBotin } from './alianzas';
import { calcularPuntajeRonda } from './puntuacion';

interface ContextoCierre {
  jugadores: Jugador[];
  configuracion: ConfiguracionMesa;
  alianzas: AlianzaBotin[];
  habilidades: RegistroHabilidad[];
  ronda: number;
  cartasPorJugadorEnRonda: number;
}

function etiquetaBonoLimpia(idEvento: string): string {
  const evento = LISTA_EVENTOS_BONO.find((e) => e.id === idEvento);
  if (!evento) return idEvento;
  return evento.etiqueta.replace(/\s*\([^)]*\)$/, '');
}

interface ClasificacionBonos {
  bonosCobradas: DetalleBono[];
  bonosNoCobradas: DetalleBono[];
  totalBonos: number;
}

function clasificarEventosBono(
  jugador: Jugador,
  acierto: boolean,
  cobrarBonosSinAcierto: boolean
): ClasificacionBonos {
  const bonosCobradas: DetalleBono[] = [];
  const bonosNoCobradas: DetalleBono[] = [];
  let totalBonos = 0;

  for (const idEvento of Object.keys(jugador.eventosBono)) {
    if (idEvento === 'alianza_botin') continue;
    const cantidad = Number(jugador.eventosBono[idEvento]) || 0;
    if (cantidad <= 0) continue;

    const evento = LISTA_EVENTOS_BONO.find((e) => e.id === idEvento);
    const unitario = evento ? evento.puntos : 0;
    const subtotal = cantidad * unitario;
    const detalle: DetalleBono = {
      etiqueta: etiquetaBonoLimpia(idEvento),
      cantidad,
      unitario,
      subtotal,
    };

    if (acierto || cobrarBonosSinAcierto) {
      bonosCobradas.push(detalle);
      totalBonos += subtotal;
    } else {
      bonosNoCobradas.push(detalle);
    }
  }

  return { bonosCobradas, bonosNoCobradas, totalBonos };
}

function agregarApuestaBribon(
  jugador: Jugador,
  acierto: boolean,
  bonos: ClasificacionBonos
): void {
  if (jugador.bribonHabilidadPts === null || jugador.bribonHabilidadPts === undefined) return;
  const pts = Number(jugador.bribonHabilidadPts);
  if (isNaN(pts) || pts <= 0) return;

  const base = jugador.bribonStolenFrom
    ? 'Apuesta de puntos: Bribón de Roatán (Copia Kong)'
    : 'Apuesta de puntos: Bribón de Roatán';

  if (acierto) {
    bonos.bonosCobradas.push({ etiqueta: `${base} (Acertada)`, cantidad: 1, unitario: pts, subtotal: pts });
    bonos.totalBonos += pts;
  } else {
    bonos.bonosCobradas.push({ etiqueta: `${base} (Fallada)`, cantidad: 1, unitario: -pts, subtotal: -pts });
    bonos.totalBonos -= pts;
  }
}

function agregarAlianzasJugador(
  indiceJugador: number,
  jugadores: Jugador[],
  alianzas: AlianzaBotin[],
  bonos: ClasificacionBonos
): void {
  const alianzasJugador = alianzas.filter(
    (al) => al.idxA === indiceJugador || al.idxB === indiceJugador
  );

  for (const alianza of alianzasJugador) {
    const esA = alianza.idxA === indiceJugador;
    const nombreOtro = esA ? alianza.nombreB : alianza.nombreA;
    const jugadorA = jugadores[alianza.idxA];
    const jugadorB = jugadores[alianza.idxB];
    if (!jugadorA || !jugadorB) continue;

    const ambosAcertaron =
      jugadorA.apuesta === jugadorA.ganadas && jugadorB.apuesta === jugadorB.ganadas;

    const detalle: DetalleBono = {
      etiqueta: `Alianza de Botín (con ${nombreOtro})`,
      cantidad: 1,
      unitario: 20,
      subtotal: 20,
    };

    if (ambosAcertaron) {
      bonos.bonosCobradas.push(detalle);
      bonos.totalBonos += 20;
    } else {
      bonos.bonosNoCobradas.push(detalle);
    }
  }
}

export interface ResultadoCierreJugador {
  jugadorActualizado: Jugador;
  entradaRonda: EntradaHistorialRonda;
  resumen: ResumenRondaJugador;
}

export function cerrarRondaParaJugador(
  indice: number,
  ctx: ContextoCierre,
  bonoBotin: number
): ResultadoCierreJugador {
  const jugador = ctx.jugadores[indice]!;
  const apuesta = Number(jugador.apuesta) || 0;
  const ganadas = Number(jugador.ganadas) || 0;

  const resultado = calcularPuntajeRonda({
    apuesta,
    ganadas,
    numeroRonda: ctx.cartasPorJugadorEnRonda,
    eventosBono: jugador.eventosBono,
    usarModoBribon: ctx.configuracion.usarModoBribon,
    modoEnvite: jugador.modoEnvite,
    bribonHabilidadPts: jugador.bribonHabilidadPts,
    cobrarBonosSinAcierto: ctx.configuracion.cobrarBonosSinAcierto,
  });

  const bonos = clasificarEventosBono(
    jugador,
    resultado.acierto,
    ctx.configuracion.cobrarBonosSinAcierto
  );

  agregarApuestaBribon(jugador, resultado.acierto, bonos);
  agregarAlianzasJugador(indice, ctx.jugadores, ctx.alianzas, bonos);

  const habilidadesJugador = ctx.habilidades.filter(
    (h) => h.jugadorIdx === indice || h.jugadorNombre === jugador.nombre
  );

  const totalRonda = resultado.puntajeTotal + bonoBotin;

  const entradaRonda: EntradaHistorialRonda = {
    ronda: ctx.ronda,
    apuesta,
    ganadas,
    acierto: resultado.acierto,
    puntajeBase: resultado.puntajeBase,
    totalBonos: bonos.totalBonos,
    bonosCobradas: bonos.bonosCobradas,
    bonosNoCobradas: bonos.bonosNoCobradas,
    habilidadesRegistradas: habilidadesJugador,
    totalRonda,
    acumuladoAnterior: 0,
    acumuladoNuevo: 0,
  };

  const jugadorActualizado: Jugador = {
    ...jugador,
    capturasSkullKing: jugador.capturasSkullKing + (Number(jugador.eventosBono.pirata_por_sk) || 0),
    capturasSirena:
      jugador.capturasSirena +
      (Number(jugador.eventosBono.sk_por_sirena) || 0) +
      (Number(jugador.eventosBono.sirena_por_pirata) || 0),
    capturasMonstruo:
      jugador.capturasMonstruo + (Number(jugador.eventosBono.monstruo_davy) || 0),
    apuesta: 0,
    ganadas: 0,
    modoEnvite: 'metralla',
    bribonHabilidadPts: null,
    bribonStolenFrom: null,
    eventosBono: {},
  };

  const resumen: ResumenRondaJugador = { nombre: jugador.nombre, ...entradaRonda };
  return { jugadorActualizado, entradaRonda, resumen };
}

function reemplazarOAgregarEntrada(
  historial: EntradaHistorialRonda[],
  entrada: EntradaHistorialRonda,
  editandoRondaAnterior: boolean
): EntradaHistorialRonda[] {
  if (!editandoRondaAnterior) return [...historial, entrada];
  const idx = historial.findIndex((h) => h.ronda === entrada.ronda);
  if (idx === -1) return [...historial, entrada];
  const copia = [...historial];
  copia[idx] = entrada;
  return copia;
}

export function recalcularAcumulados(historial: EntradaHistorialRonda[]): {
  historial: EntradaHistorialRonda[];
  puntos: number;
  apuestasAcertadas: number;
  apuestasFalladas: number;
} {
  let acumulador = 0;
  let aciertos = 0;
  let fallos = 0;

  const historialActualizado = historial.map((entrada) => {
    const acumuladoAnterior = acumulador;
    acumulador += entrada.totalRonda;
    if (entrada.apuesta !== '-') {
      if (entrada.acierto) aciertos++;
      else fallos++;
    }
    return { ...entrada, acumuladoAnterior, acumuladoNuevo: acumulador };
  });

  return {
    historial: historialActualizado,
    puntos: acumulador,
    apuestasAcertadas: aciertos,
    apuestasFalladas: fallos,
  };
}

export interface ResultadoCierreRonda {
  jugadores: Jugador[];
  resumen: ResumenRondaJugador[];
}

export function cerrarRonda(
  ctx: ContextoCierre,
  editandoRondaAnterior: boolean
): ResultadoCierreRonda {
  const bonosBotin = calcularBonosAlianzasBotin(ctx.alianzas, ctx.jugadores);

  const cierresPorJugador = ctx.jugadores.map((_, indice) =>
    cerrarRondaParaJugador(indice, ctx, bonosBotin[indice] ?? 0)
  );

  const jugadoresConHistorial = cierresPorJugador.map(({ jugadorActualizado, entradaRonda }) => {
    const historial = reemplazarOAgregarEntrada(
      jugadorActualizado.historial,
      entradaRonda,
      editandoRondaAnterior
    );
    return { ...jugadorActualizado, historial };
  });

  const jugadoresFinales = jugadoresConHistorial.map((jugador) => {
    const recalculo = recalcularAcumulados(jugador.historial);
    return {
      ...jugador,
      historial: recalculo.historial,
      puntos: recalculo.puntos,
      apuestasAcertadas: recalculo.apuestasAcertadas,
      apuestasFalladas: recalculo.apuestasFalladas,
    };
  });

  const resumen = cierresPorJugador.map(({ resumen: resumenJugador }, indice) => {
    const jugadorFinal = jugadoresFinales[indice]!;
    return { ...resumenJugador, acumuladoNuevo: jugadorFinal.puntos };
  });

  return { jugadores: jugadoresFinales, resumen };
}

export function aplicarBonoFinalDeBlancas(
  jugadores: Jugador[],
  resumen: ResumenRondaJugador[],
  calcularBono: (cantidad: number) => number
): { jugadores: Jugador[]; resumen: ResumenRondaJugador[] } {
  const jugadoresActualizados = jugadores.map((jugador) => {
    const bono = calcularBono(jugador.cartasBlancas);
    if (bono <= 0) return jugador;

    const entradaBono: EntradaHistorialRonda = {
      ronda: 'Final (Blancas)',
      apuesta: '-',
      ganadas: '-',
      acierto: true,
      puntajeBase: 0,
      totalBonos: bono,
      bonosCobradas: [
        {
          etiqueta: 'Cartas Blancas acumuladas',
          cantidad: jugador.cartasBlancas,
          unitario: '-',
          subtotal: bono,
        },
      ],
      bonosNoCobradas: [],
      totalRonda: bono,
      acumuladoAnterior: jugador.puntos,
      acumuladoNuevo: jugador.puntos + bono,
    };

    return {
      ...jugador,
      historial: [...jugador.historial, entradaBono],
      puntos: jugador.puntos + bono,
    };
  });

  const resumenActualizado = resumen.map((entrada) => {
    const jugador = jugadoresActualizados.find((j) => j.nombre === entrada.nombre);
    if (!jugador) return entrada;
    const bono = calcularBono(jugador.cartasBlancas);
    if (bono <= 0) return entrada;
    return {
      ...entrada,
      bonosCobradas: [
        ...entrada.bonosCobradas,
        {
          etiqueta: 'Cartas Blancas acumuladas (Bono Final)',
          cantidad: jugador.cartasBlancas,
          unitario: '-' as const,
          subtotal: bono,
        },
      ],
      totalBonos: entrada.totalBonos + bono,
      totalRonda: entrada.totalRonda + bono,
      acumuladoNuevo: entrada.acumuladoNuevo + bono,
    };
  });

  return { jugadores: jugadoresActualizados, resumen: resumenActualizado };
}
