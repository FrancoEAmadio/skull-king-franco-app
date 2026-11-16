import type { EntradaHistorialRonda, RankingJugador } from '../tipos';

export const NOMBRE_BARBAGRIS = 'Barbagrís';
export const AVATAR_BARBAGRIS = '🧔';

/**
 * Barbagrís es el fantasma que se suma en partidas de 2 jugadores: no envida y no puntúa en las reglas reales.
 * Acá es una broma del historial: se le asigna un envite de 0 y las bazas que no ganó ninguno de los dos
 * (cartas de la ronda − bazas de los jugadores), y se calcula cuántos puntos habría hecho.
 */
export function construirBarbagris(
  jugadores: { historial: EntradaHistorialRonda[] }[],
  cartasPorRonda: number[]
): RankingJugador | null {
  if (jugadores.length !== 2) return null;
  const referencia = jugadores.reduce<EntradaHistorialRonda[]>(
    (mejor, j) => (j.historial.length > mejor.length ? j.historial : mejor),
    []
  );
  const historial: EntradaHistorialRonda[] = [];
  let acumulado = 0;
  for (const entrada of referencia) {
    if (typeof entrada.ronda !== 'number') continue;
    const cartas = cartasPorRonda[entrada.ronda - 1];
    if (!cartas || cartas < 1) continue;
    const ganadasDeLosDos = jugadores.reduce((suma, j) => {
      const propia = j.historial.find((e) => e.ronda === entrada.ronda);
      return suma + (propia ? Number(propia.ganadas) || 0 : 0);
    }, 0);
    const ganadas = Math.max(0, cartas - ganadasDeLosDos);
    const acierto = ganadas === 0;
    const puntajeBase = acierto ? 10 * cartas : -10 * cartas;
    const anterior = acumulado;
    acumulado += puntajeBase;
    historial.push({
      ronda: entrada.ronda,
      apuesta: 0,
      ganadas,
      acierto,
      puntajeBase,
      totalBonos: 0,
      bonosCobradas: [],
      bonosNoCobradas: [],
      totalRonda: puntajeBase,
      acumuladoAnterior: anterior,
      acumuladoNuevo: acumulado,
    });
  }
  if (historial.length === 0) return null;
  return { nombre: NOMBRE_BARBAGRIS, puntos: acumulado, historial };
}
