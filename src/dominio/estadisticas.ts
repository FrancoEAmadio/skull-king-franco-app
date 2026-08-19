import { MAX_PARTIDAS_EVOLUCION } from '../constantes';
import type { EntradaEvolucion, EstadisticasJugador, JugadorPermanente } from '../tipos';

export function crearEstadisticasVacias(): EstadisticasJugador {
  return {
    partidasJugadas: 0,
    victorias: 0,
    segundoPuesto: 0,
    tercerPuesto: 0,
    sumaPuntos: 0,
    mejorPartida: null,
    peorPartida: null,
    apuestasAcertadas: 0,
    apuestasFalladas: 0,
    capturasSkullKing: 0,
    capturasSirena: 0,
    capturasMonstruo: 0,
  };
}

export function crearJugadorPermanente(nombre: string): JugadorPermanente {
  return {
    id: `pirata_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    nombre: (nombre || 'Pirata').trim() || 'Pirata',
    estadisticas: crearEstadisticasVacias(),
    evolucion: [],
  };
}

export function calcularPromedioPuntos(jugador: JugadorPermanente): number {
  const est = jugador.estadisticas;
  if (!est.partidasJugadas) return 0;
  return Math.round(est.sumaPuntos / est.partidasJugadas);
}

export function calcularPorcentajeAciertos(jugador: JugadorPermanente): number {
  const est = jugador.estadisticas;
  const total = est.apuestasAcertadas + est.apuestasFalladas;
  if (!total) return 0;
  return Math.round((est.apuestasAcertadas / total) * 100);
}

export interface FrecuenciaPosicion {
  posicion: number;
  cantidad: number;
}

export function calcularPosicionesFrecuentes(
  evolucion: EntradaEvolucion[],
  limite = 3
): FrecuenciaPosicion[] {
  const frecuencias = evolucion.reduce<Map<number, number>>((conteos, entrada) => {
    if (!Number.isInteger(entrada.posicion) || entrada.posicion <= 0) return conteos;
    conteos.set(entrada.posicion, (conteos.get(entrada.posicion) ?? 0) + 1);
    return conteos;
  }, new Map());

  return [...frecuencias.entries()]
    .map(([posicion, cantidad]) => ({ posicion, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad || a.posicion - b.posicion)
    .slice(0, limite);
}

export interface DatosFinPartidaJugador {
  fecha: string;
  puntos: number;
  posicion: number;
  apuestasAcertadas: number;
  apuestasFalladas: number;
  capturasSkullKing: number;
  capturasSirena: number;
  capturasMonstruo: number;
}

export function aplicarFinDePartida(
  jugador: JugadorPermanente,
  datos: DatosFinPartidaJugador
): JugadorPermanente {
  const est = { ...jugador.estadisticas };

  est.partidasJugadas += 1;
  est.sumaPuntos += datos.puntos;

  if (datos.posicion === 1) est.victorias += 1;
  else if (datos.posicion === 2) est.segundoPuesto += 1;
  else if (datos.posicion === 3) est.tercerPuesto += 1;

  if (est.mejorPartida === null || datos.puntos > est.mejorPartida) est.mejorPartida = datos.puntos;
  if (est.peorPartida === null || datos.puntos < est.peorPartida) est.peorPartida = datos.puntos;

  est.apuestasAcertadas += datos.apuestasAcertadas;
  est.apuestasFalladas += datos.apuestasFalladas;
  est.capturasSkullKing += datos.capturasSkullKing;
  est.capturasSirena += datos.capturasSirena;
  est.capturasMonstruo += datos.capturasMonstruo;

  const nuevaEvolucion = [
    ...jugador.evolucion,
    { fecha: datos.fecha, puntos: datos.puntos, posicion: datos.posicion },
  ].slice(-MAX_PARTIDAS_EVOLUCION);

  return { ...jugador, estadisticas: est, evolucion: nuevaEvolucion };
}
