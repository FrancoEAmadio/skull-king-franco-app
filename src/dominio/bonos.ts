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
  const { modoContenido, reglasOpcionales } = ctx.configuracion;
  let total = 0;
  if (modoContenido !== 'base' && reglasOpcionales.kraken) total++;
  if (modoContenido !== 'base' && reglasOpcionales.ballenaBlanca) total++;
  if (modoContenido === 'expansion' && reglasOpcionales.mantarrayaMoteada) total++;
  return total;
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
  const usadoPorOtros = sumarUsadoPorOtros(idEvento, ctx);
  const limiteBase =
    idEvento === 'pirata_por_sk'
      ? limiteBaseCasoPirataPorSk(ctx)
      : idEvento === 'monstruo_davy'
      ? limiteBaseCasoMonstruoDavy(ctx)
      : LIMITES_FIJOS[idEvento] ?? 99;

  return Math.max(0, limiteBase - usadoPorOtros);
}
