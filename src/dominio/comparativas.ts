import type {
  EntradaHistorialPartida,
  EntradaHistorialRonda,
  JugadorPermanente,
} from '../tipos';

// ── Series para el gráfico de evolución ────────────────────────────────

export interface JugadorConHistorial {
  nombre: string;
  historial: EntradaHistorialRonda[];
}

export interface SeriesEvolucion {
  series: { nombre: string; puntos: number[] }[];
  /** Etiquetas del eje X; posición 0 = "Inicio". */
  etiquetas: string[];
}

function etiquetaRonda(ronda: number | string): string {
  if (typeof ronda === 'number') return `R${ronda}`;
  return ronda.toLowerCase().startsWith('final') ? 'Final' : String(ronda);
}

/** Convierte el historial de ronda de cada jugador en curvas de puntaje acumulado. */
export function construirSeriesEvolucion(jugadores: JugadorConHistorial[]): SeriesEvolucion {
  const referencia = jugadores.reduce<EntradaHistorialRonda[]>(
    (mejor, jugador) => (jugador.historial.length > mejor.length ? jugador.historial : mejor),
    []
  );
  const etiquetas = ['Inicio', ...referencia.map((entrada) => etiquetaRonda(entrada.ronda))];
  const series = jugadores.map((jugador) => {
    const puntos = [0];
    let acumulado = 0;
    for (const entrada of jugador.historial) {
      acumulado = entrada.acumuladoNuevo;
      puntos.push(acumulado);
    }
    // Si el jugador tiene menos entradas (p. ej. sin bono final) se mantiene su último valor.
    while (puntos.length < etiquetas.length) puntos.push(acumulado);
    return { nombre: jugador.nombre, puntos };
  });
  return { series, etiquetas };
}

// ── Rendimiento comparativo entre jugadores ────────────────────────────

export interface Rendimiento {
  clave: string;
  nombre: string;
  partidas: number;
  victorias: number;
  porcentajeVictorias: number;
  promedioPuntos: number;
  mejorPartida: number | null;
  rondasJugadas: number;
  /** % de rondas en las que el envite fue exacto. */
  precisionEnvites: number;
  /** Mayor cantidad de rondas seguidas acertando el envite dentro de una misma partida. */
  mejorRacha: number;
  puntosPorRonda: number;
  /** Bonificaciones netas por ronda jugada. */
  bonosPorRonda: number;
  /** % del valor de las bonificaciones que efectivamente se cobró (acertando el envite). */
  efectividadBonos: number;
  totalBonosCobrados: number;
  totalBonosPerdidos: number;
}

const redondear = (valor: number) => Math.round(valor);
const porcentaje = (parte: number, total: number) => (total ? redondear((parte / total) * 100) : 0);

function claveJugador(permanenteId: string | undefined, nombre: string): string {
  return permanenteId ? `id:${permanenteId}` : `n:${nombre.trim().toLowerCase()}`;
}

interface Acumulador {
  clave: string;
  nombre: string;
  idPermanente?: string;
  partidas: number;
  victorias: number;
  sumaPuntos: number;
  mejorPartida: number | null;
  rondas: number;
  aciertos: number;
  mejorRacha: number;
  sumaTotalRonda: number;
  sumaBonos: number;
  bonosCobrados: number;
  bonosPerdidos: number;
}

/**
 * Calcula el rendimiento de TODOS los jugadores que aparecen en el historial.
 * Las partidas nuevas se vinculan por id de tarjeta; las anteriores, por nombre.
 */
export function calcularRendimientos(
  historial: EntradaHistorialPartida[],
  jugadoresPermanentes: JugadorPermanente[] = []
): Rendimiento[] {
  const idPorNombre = new Map(
    jugadoresPermanentes.map((jugador) => [jugador.nombre.trim().toLowerCase(), jugador.id])
  );
  const mapa = new Map<string, Acumulador>();

  for (const partida of historial) {
    partida.ranking.forEach((fila, posicion) => {
      const idEfectivo = fila.permanenteId ?? idPorNombre.get(fila.nombre.trim().toLowerCase());
      const clave = claveJugador(idEfectivo, fila.nombre);
      let acc = mapa.get(clave);
      if (!acc) {
        acc = {
          clave,
          nombre: fila.nombre,
          idPermanente: idEfectivo,
          partidas: 0,
          victorias: 0,
          sumaPuntos: 0,
          mejorPartida: null,
          rondas: 0,
          aciertos: 0,
          mejorRacha: 0,
          sumaTotalRonda: 0,
          sumaBonos: 0,
          bonosCobrados: 0,
          bonosPerdidos: 0,
        };
        mapa.set(clave, acc);
      }
      // El nombre más reciente gana (por si la tarjeta fue renombrada).
      if (idEfectivo) {
        const tarjeta = jugadoresPermanentes.find((jugador) => jugador.id === idEfectivo);
        acc.nombre = tarjeta?.nombre ?? acc.nombre;
      }

      acc.partidas += 1;
      if (posicion === 0) acc.victorias += 1;
      acc.sumaPuntos += fila.puntos;
      acc.mejorPartida = acc.mejorPartida === null ? fila.puntos : Math.max(acc.mejorPartida, fila.puntos);

      let racha = 0;
      for (const ronda of fila.historial) {
        const esRondaReal = typeof ronda.apuesta === 'number';
        acc.sumaBonos += ronda.totalBonos;
        acc.sumaTotalRonda += ronda.totalRonda;
        for (const bono of ronda.bonosCobradas) acc.bonosCobrados += Math.max(0, bono.subtotal);
        for (const bono of ronda.bonosNoCobradas) acc.bonosPerdidos += Math.max(0, bono.subtotal);
        if (!esRondaReal) continue;
        acc.rondas += 1;
        if (ronda.acierto) {
          acc.aciertos += 1;
          racha += 1;
          acc.mejorRacha = Math.max(acc.mejorRacha, racha);
        } else {
          racha = 0;
        }
      }
    });
  }

  return [...mapa.values()].map((acc) => ({
    clave: acc.clave,
    nombre: acc.nombre,
    partidas: acc.partidas,
    victorias: acc.victorias,
    porcentajeVictorias: porcentaje(acc.victorias, acc.partidas),
    promedioPuntos: acc.partidas ? redondear(acc.sumaPuntos / acc.partidas) : 0,
    mejorPartida: acc.mejorPartida,
    rondasJugadas: acc.rondas,
    precisionEnvites: porcentaje(acc.aciertos, acc.rondas),
    mejorRacha: acc.mejorRacha,
    puntosPorRonda: acc.rondas ? Math.round((acc.sumaTotalRonda / acc.rondas) * 10) / 10 : 0,
    bonosPorRonda: acc.rondas ? Math.round((acc.sumaBonos / acc.rondas) * 10) / 10 : 0,
    efectividadBonos: porcentaje(acc.bonosCobrados, acc.bonosCobrados + acc.bonosPerdidos),
    totalBonosCobrados: acc.bonosCobrados,
    totalBonosPerdidos: acc.bonosPerdidos,
  }));
}

export function buscarRendimiento(
  rendimientos: Rendimiento[],
  jugador: JugadorPermanente
): Rendimiento | null {
  return (
    rendimientos.find((r) => r.clave === `id:${jugador.id}`) ??
    rendimientos.find((r) => r.clave === `n:${jugador.nombre.trim().toLowerCase()}`) ??
    null
  );
}

export type MetricaComparable =
  | 'porcentajeVictorias'
  | 'promedioPuntos'
  | 'precisionEnvites'
  | 'efectividadBonos'
  | 'mejorRacha'
  | 'puntosPorRonda';

export interface FilaComparacion {
  metrica: MetricaComparable;
  etiqueta: string;
  sufijo: string;
  jugador: number;
  resto: number | null;
  /** Puesto del jugador entre todos los que tienen partidas (1 = mejor). */
  puesto: number;
  de: number;
}

const METRICAS: { metrica: MetricaComparable; etiqueta: string; sufijo: string }[] = [
  { metrica: 'porcentajeVictorias', etiqueta: 'Victorias', sufijo: '%' },
  { metrica: 'promedioPuntos', etiqueta: 'Promedio por partida', sufijo: ' pts' },
  { metrica: 'puntosPorRonda', etiqueta: 'Puntos por ronda', sufijo: ' pts' },
  { metrica: 'precisionEnvites', etiqueta: 'Envites acertados', sufijo: '%' },
  { metrica: 'efectividadBonos', etiqueta: 'Bonos cobrados', sufijo: '%' },
  { metrica: 'mejorRacha', etiqueta: 'Mejor racha de aciertos', sufijo: '' },
];

/** Compara a un jugador contra el promedio del resto de la mesa histórica. */
export function compararContraElResto(
  rendimientos: Rendimiento[],
  propio: Rendimiento
): FilaComparacion[] {
  const conPartidas = rendimientos.filter((r) => r.partidas > 0);
  const otros = conPartidas.filter((r) => r.clave !== propio.clave);

  return METRICAS.map(({ metrica, etiqueta, sufijo }) => {
    const valores = conPartidas.map((r) => r[metrica]);
    const jugador = propio[metrica];
    const mejores = valores.filter((valor) => valor > jugador).length;
    const resto = otros.length
      ? Math.round((otros.reduce((suma, r) => suma + r[metrica], 0) / otros.length) * 10) / 10
      : null;
    return { metrica, etiqueta, sufijo, jugador, resto, puesto: mejores + 1, de: conPartidas.length };
  });
}
