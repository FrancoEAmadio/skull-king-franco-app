import { estaDisponibleEventoBono, estaReglaActiva } from './disponibilidadContenido';
import type { ConfiguracionMesa, Jugador } from '../tipos';

interface ContextoLimite {
  jugadorSeleccionadoIdx: number;
  jugadores: Jugador[];
  configuracion: ConfiguracionMesa;
  cartasPorJugadorEnRonda: number;
}

/** Cartas que hay jugadas en la mesa en la ronda: jugadores × cartas repartidas a cada uno. */
export function calcularCartasEnMesa(cantidadJugadores: number, cartasPorJugador: number): number {
  return Math.max(0, (cantidadJugadores || 0) * (cartasPorJugador || 0));
}

/**
 * Máximo de cartas que puede capturar una carta especial (Skull King, Sirena, Davy Jones, Kong):
 * todas las cartas de la mesa menos la propia carta que captura.
 */
export function calcularMaximoCapturable(ctx: ContextoLimite): number {
  const enMesa = calcularCartasEnMesa(ctx.jugadores.length, ctx.cartasPorJugadorEnRonda);
  return Math.max(0, enMesa - 1);
}

function sumarUsadoPorOtros(idEvento: string, ctx: ContextoLimite): number {
  return ctx.jugadores.reduce((acc, jugador, idx) => {
    if (idx === ctx.jugadorSeleccionadoIdx) return acc;
    return acc + (Number(jugador.eventosBono?.[idEvento]) || 0);
  }, 0);
}

/** Piratas que existen en el mazo: 6 en el juego base y 7 con la expansión (Mary Thorne). */
function piratasEnMazo(ctx: ContextoLimite): number {
  return ctx.configuracion.modoContenido === 'expansion' ? 7 : 6;
}

/** Monstruos que existen en el mazo de la expansión: Kraken, Ballena Blanca y Mantarraya. */
const MONSTRUOS_EN_MAZO = 3;

/**
 * Eventos que cobra solo quien juega la carta especial (la única Skull King o el único Davy Jones
 * de la mesa). Lo que registró otro jugador no le quita cupo a este.
 */
const EVENTOS_DE_CARTA_UNICA = new Set(['pirata_por_sk', 'monstruo_davy']);

/** Eventos que dependen de cuántas cartas hay en la mesa (se capturan con una carta especial). */
const EVENTOS_POR_CAPTURA_ESPECIAL = new Set([
  'pirata_por_sk',
  'sk_por_sirena',
  'sirena_por_pirata',
  'monstruo_davy',
  'kong_por_sk_sirena',
]);

const LIMITES_FIJOS: Record<string, number> = {
  sk_por_sirena: 1,
  sirena_por_pirata: 2,
  catorce_negro: 1,
  catorce_color: 3,
  ocho_expansion: 4,
  siete_expansion: 4,
  kong_por_sk_sirena: 1,
};

function limiteDeMazo(idEvento: string, ctx: ContextoLimite): number {
  if (idEvento === 'pirata_por_sk') return piratasEnMazo(ctx);
  if (idEvento === 'monstruo_davy') return MONSTRUOS_EN_MAZO;
  return LIMITES_FIJOS[idEvento] ?? 99;
}

export function calcularMaximoDisponible(idEvento: string, ctx: ContextoLimite): number {
  if (!estaDisponibleEventoBono(idEvento, ctx.configuracion)) return 0;

  let limite = limiteDeMazo(idEvento, ctx);
  if (EVENTOS_POR_CAPTURA_ESPECIAL.has(idEvento)) {
    limite = Math.min(limite, calcularMaximoCapturable(ctx));
  }

  const usadoPorOtros = EVENTOS_DE_CARTA_UNICA.has(idEvento) ? 0 : sumarUsadoPorOtros(idEvento, ctx);
  return Math.max(0, limite - usadoPorOtros);
}

// ── Puntos por cartas capturadas (14, 8 y 7) ────────────────────────────────

const PTS_POR_TOQUE_CARTAS = 5;

/** Valores de las cartas que dan bonificación, de mayor a menor: 14 negro, tres 14 de color y cuatro 8. */
function bonificacionesPositivas(configuracion: ConfiguracionMesa): number[] {
  const valores = [20, 10, 10, 10];
  if (estaReglaActiva(configuracion, 'carta8')) valores.push(5, 5, 5, 5);
  return valores;
}

export interface LimitePuntosCartas {
  /** Tope de toques (de +5) que se pueden sumar. */
  maxToques: number;
  /** Tope de toques (de −5) que se pueden restar. */
  minToques: number;
  maxPuntos: number;
  minPuntos: number;
}

/**
 * Puntaje máximo teórico que un jugador puede sumar por cartas capturadas en la ronda.
 * No puede capturar más cartas bonificadoras que cartas hay en la mesa ni más que las que existen
 * en el mazo; el mínimo (cartas 7, −5) solo existe si esa regla está activa.
 */
export function calcularLimitePuntosCartas(
  configuracion: ConfiguracionMesa,
  cantidadJugadores: number,
  cartasPorJugador: number
): LimitePuntosCartas {
  const enMesa = calcularCartasEnMesa(cantidadJugadores, cartasPorJugador);

  const maxPuntos = bonificacionesPositivas(configuracion)
    .slice(0, enMesa)
    .reduce((acc, valor) => acc + valor, 0);

  const minPuntos = estaReglaActiva(configuracion, 'carta7') ? -Math.min(enMesa, 4) * 5 : 0;

  return {
    maxPuntos,
    minPuntos,
    maxToques: Math.floor(maxPuntos / PTS_POR_TOQUE_CARTAS),
    minToques: Math.ceil(minPuntos / PTS_POR_TOQUE_CARTAS),
  };
}
