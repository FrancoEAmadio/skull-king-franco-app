import { estaDisponibleEventoBono, estaReglaActiva } from './disponibilidadContenido';
import type { ConfiguracionMesa, Jugador } from '../tipos';

interface ContextoLimite {
  jugadorSeleccionadoIdx: number;
  jugadores: Jugador[];
  configuracion: ConfiguracionMesa;
  cartasPorJugadorEnRonda: number;
}

function sumarUsadoPorOtros(idEvento: string, ctx: ContextoLimite): number {
  return ctx.jugadores.reduce((acc, jugador, idx) => {
    if (idx === ctx.jugadorSeleccionadoIdx) return acc;
    return acc + (Number(jugador.eventosBono?.[idEvento]) || 0);
  }, 0);
}

/** Cartas que se reparten en la mesa en esta ronda (jugadores × cartas de cada uno). */
export function totalCartasEnMesa(ctx: ContextoLimite): number {
  return (ctx.jugadores.length || 2) * ctx.cartasPorJugadorEnRonda;
}

/** Una carta especial captura como máximo a todas las demás cartas de la mesa: total − 1. */
function maximoPorCartasEnMesa(ctx: ContextoLimite): number {
  return Math.max(0, totalCartasEnMesa(ctx) - 1);
}

function limiteBaseCasoPirataPorSk(ctx: ContextoLimite): number {
  const maxPiratasMazo = ctx.configuracion.modoContenido === 'expansion' ? 7 : 6;
  return Math.min(maxPiratasMazo, maximoPorCartasEnMesa(ctx));
}

/** En el mazo hay 3 monstruos como máximo (Kraken, Ballena Blanca y Mantarraya). */
const MONSTRUOS_EN_EL_MAZO = 3;

function limiteBaseCasoMonstruoDavy(ctx: ContextoLimite): number {
  return Math.min(MONSTRUOS_EN_EL_MAZO, maximoPorCartasEnMesa(ctx));
}

/**
 * Rango de puntos (en pasos de 5) del control "Puntos por cartas capturadas".
 * Se arma con las cartas con bonificación que existen (un 14 negro de +20, tres 14 de color de +10,
 * cuatro 8 de +5 y cuatro 7 de −5) y solo hay tantas como cartas repartidas en la mesa.
 */
export function limitesPuntosCartas(ctx: ContextoLimite): { minimo: number; maximo: number } {
  const enMesa = totalCartasEnMesa(ctx);
  const positivas = [20, 10, 10, 10];
  if (estaReglaActiva(ctx.configuracion, 'carta8')) positivas.push(5, 5, 5, 5);
  const maximo = positivas.slice(0, enMesa).reduce((acc, pts) => acc + pts, 0);
  const cantidad7 = estaReglaActiva(ctx.configuracion, 'carta7') ? Math.min(4, enMesa) : 0;
  return { minimo: -5 * cantidad7, maximo };
}

const LIMITES_FIJOS: Record<string, number> = {
  sk_por_sirena: 1,
  sirena_por_pirata: 2,
  catorce_negro: 1,
  catorce_color: 3,
  ocho_expansion: 4,
  siete_expansion: 4,
  kong_por_sk_sirena: 1,
};

/** Las capturas de una carta especial nunca pueden superar a las demás cartas de la mesa. */
const EVENTOS_LIMITADOS_POR_MESA = new Set(['sk_por_sirena', 'sirena_por_pirata', 'kong_por_sk_sirena']);

export function calcularMaximoDisponible(idEvento: string, ctx: ContextoLimite): number {
  if (!estaDisponibleEventoBono(idEvento, ctx.configuracion)) return 0;
  const usadoPorOtros = sumarUsadoPorOtros(idEvento, ctx);
  const limiteBase =
    idEvento === 'pirata_por_sk'
      ? limiteBaseCasoPirataPorSk(ctx)
      : idEvento === 'monstruo_davy'
      ? limiteBaseCasoMonstruoDavy(ctx)
      : EVENTOS_LIMITADOS_POR_MESA.has(idEvento)
      ? Math.min(LIMITES_FIJOS[idEvento] ?? 99, maximoPorCartasEnMesa(ctx))
      : LIMITES_FIJOS[idEvento] ?? 99;

  return Math.max(0, limiteBase - usadoPorOtros);
}
