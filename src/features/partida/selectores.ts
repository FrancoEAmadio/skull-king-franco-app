import type { ConfiguracionMesa, Jugador } from '../../tipos';
import { MAX_COMODINES_BASE, MAX_COMODINES_EXPANSION } from '../../constantes';

export interface ItemJugadorOrdenado {
  jugador: Jugador;
  originalIndex: number;
}

export function calcularIndiceJugadorInicial(numeroRonda: number, cantidadJugadores: number): number {
  if (cantidadJugadores === 0) return 0;
  return (numeroRonda - 1) % cantidadJugadores;
}

export function calcularJugadoresOrdenados(
  jugadores: Jugador[],
  indiceInicial: number
): ItemJugadorOrdenado[] {
  if (jugadores.length === 0) return [];
  const items = jugadores.map((jugador, originalIndex) => ({ jugador, originalIndex }));
  return items.slice(indiceInicial).concat(items.slice(0, indiceInicial));
}

export function calcularIndiceJugadorReparte(indiceInicial: number, cantidadJugadores: number): number {
  if (cantidadJugadores === 0) return 0;
  return (indiceInicial - 1 + cantidadJugadores) % cantidadJugadores;
}

export function calcularCartasPorJugadorEnRonda(
  cartasPorRonda: number[],
  rondaActual: number
): number {
  const valor = Number(cartasPorRonda[rondaActual - 1]);
  return !isNaN(valor) && valor >= 1 ? valor : Number(rondaActual) || 1;
}

export function calcularMaxGanadasPara(
  indiceJugador: number,
  jugadores: Jugador[],
  cartasPorJugadorEnRonda: number
): number {
  const sumaOtras = jugadores.reduce((acc, jugador, idx) => {
    if (idx === indiceJugador) return acc;
    return acc + (Number(jugador.ganadas) || 0);
  }, 0);
  return Math.max(0, cartasPorJugadorEnRonda - sumaOtras);
}

export interface LimiteComodines {
  comodinesDisponibles: number;
  comodinesBloqueados: boolean;
  maxComodinesPermitidos: number;
}

export function calcularLimiteComodines(
  jugadores: Jugador[],
  indiceJugadorActual: number,
  configuracion: ConfiguracionMesa
): LimiteComodines {
  const sumaOtras = jugadores.reduce((acc, jugador, idx) => {
    if (idx === indiceJugadorActual) return acc;
    return acc + (Number(jugador.cartasBlancas) || 0);
  }, 0);

  const maxComodinesPermitidos =
    configuracion.modoContenido === 'expansion' ? MAX_COMODINES_EXPANSION : MAX_COMODINES_BASE;

  const cartasBlancasActual = Number(jugadores[indiceJugadorActual]?.cartasBlancas) || 0;
  const comodinesDisponibles = Math.max(0, maxComodinesPermitidos - sumaOtras);
  const comodinesBloqueados = sumaOtras + cartasBlancasActual >= maxComodinesPermitidos;

  return { comodinesDisponibles, comodinesBloqueados, maxComodinesPermitidos };
}
