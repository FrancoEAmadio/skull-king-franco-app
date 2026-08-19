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

function limiteBaseCasoPirataPorSk(ctx: ContextoLimite): number {
  const maxPiratasMazo = ctx.configuracion.modoContenido === 'expansion' ? 7 : 6;
  const numJugadores = ctx.jugadores.length || 2;
  return Math.min(maxPiratasMazo, (numJugadores - 1) * ctx.cartasPorJugadorEnRonda);
}

function limiteBaseCasoMonstruoDavy(ctx: ContextoLimite): number {
  const monstruos = ['kraken', 'ballenaBlanca', 'mantarrayaMoteada'] as const;
  return monstruos.filter((regla) => estaReglaActiva(ctx.configuracion, regla)).length;
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

export function calcularMaximoDisponible(idEvento: string, ctx: ContextoLimite): number {
  if (!estaDisponibleEventoBono(idEvento, ctx.configuracion)) return 0;
  const usadoPorOtros = sumarUsadoPorOtros(idEvento, ctx);
  const limiteBase =
    idEvento === 'pirata_por_sk'
      ? limiteBaseCasoPirataPorSk(ctx)
      : idEvento === 'monstruo_davy'
      ? limiteBaseCasoMonstruoDavy(ctx)
      : LIMITES_FIJOS[idEvento] ?? 99;

  return Math.max(0, limiteBase - usadoPorOtros);
}
