import { estaDisponibleEventoBono, estaReglaActiva } from './disponibilidadContenido';
import type { ConfiguracionMesa, Jugador } from '../tipos';

export interface ContextoLimite {
  jugadorSeleccionadoIdx: number;
  jugadores: Jugador[];
  configuracion: ConfiguracionMesa;
  cartasPorJugadorEnRonda: number;
  /** Piratas que ya se usaron en habilidades en esta ronda (Bribón, Harry). */
  piratasEnHabilidades?: number;
  /** Si Primer Oficial Kong ya se usó como habilidad en esta ronda. */
  kongEnHabilidad?: boolean;
  /** Alianzas de Botín registradas en la ronda (cada una usa una carta de Botín). */
  alianzasBotin?: number;
}

type Eventos = Record<string, number>;

/** Cartas especiales con presupuesto físico: son únicas y solo existen tantas como las repartidas. */
export const EVENTOS_ESPECIALES = [
  'pirata_por_sk',
  'sk_por_sirena',
  'sirena_por_pirata',
  'kong_por_sk_sirena',
  'monstruo_davy',
] as const;

const PALOS = ['siete_expansion', 'ocho_expansion', 'catorce_color', 'catorce_negro'] as const;

const LIMITES_FIJOS: Record<string, number> = {
  catorce_negro: 1,
  catorce_color: 3,
  ocho_expansion: 4,
  siete_expansion: 4,
};

/** Cartas que se reparten en la mesa en esta ronda (jugadores × cartas de cada uno). */
export function totalCartasEnMesa(ctx: Pick<ContextoLimite, 'jugadores' | 'cartasPorJugadorEnRonda'>): number {
  return (ctx.jugadores.length || 2) * ctx.cartasPorJugadorEnRonda;
}

/** Piratas que existen en el mazo: 6 en Base/Avanzadas; Mary Thorne es la 7.ª y solo está en Expansión. */
export function maximoPiratas(configuracion: ConfiguracionMesa): number {
  return configuracion.modoContenido === 'expansion' ? 7 : 6;
}

/** Davy Jones solo existe en Expansión y ahí hay 3 monstruos en el mazo (Kraken, Ballena y Mantarraya). */
function monstruosEnMazo(configuracion: ConfiguracionMesa): number {
  return configuracion.modoContenido === 'expansion' ? 3 : 0;
}

/** En una baza entra una carta por jugador: una carta especial captura, como máximo, a las otras jugadores − 1. */
function maximoPorBaza(ctx: Pick<ContextoLimite, 'jugadores'>): number {
  return Math.max(0, (ctx.jugadores.length || 2) - 1);
}

interface Totales {
  pirataSk: number;
  jugadoresConPirataSk: number;
  skSirena: number;
  sirenaPirata: number;
  kong: number;
  monstruos: number;
}

function totalizar(asignaciones: Eventos[]): Totales {
  const suma = (id: string) => asignaciones.reduce((acc, e) => acc + (Number(e[id]) || 0), 0);
  return {
    pirataSk: suma('pirata_por_sk'),
    jugadoresConPirataSk: asignaciones.filter((e) => (Number(e.pirata_por_sk) || 0) > 0).length,
    skSirena: suma('sk_por_sirena'),
    sirenaPirata: suma('sirena_por_pirata'),
    kong: suma('kong_por_sk_sirena'),
    monstruos: suma('monstruo_davy'),
  };
}

/**
 * Dice si el reparto de capturas de la ronda es físicamente posible.
 * `asignaciones` trae los eventos de bono de cada jugador.
 */
export function esPosibleAsignacionEspeciales(asignaciones: Eventos[], ctx: ContextoLimite): boolean {
  return detectarMotivoImposible(asignaciones, ctx) === null;
}

type Motivo = 'davy_total' | 'baza' | 'sk_unico' | 'sk_excluyente' | 'sirenas' | 'piratas' | 'kong' | 'monstruos' | 'mesa';

/** Cartas de la mesa que ya quedaron identificadas (capturas especiales, palos, habilidades y Botín). */
export function contarCartasFisicas(asignaciones: Eventos[], ctx: ContextoLimite, sinPalos = false): number {
  const t = totalizar(asignaciones);
  const habilidades = ctx.piratasEnHabilidades ?? 0;
  const sirenas = t.skSirena + t.sirenaPirata;
  const piratas = t.pirataSk + t.sirenaPirata + habilidades;
  const skCartas = t.pirataSk > 0 || t.skSirena > 0 ? 1 : 0;
  const kongCartas = t.kong > 0 || ctx.kongEnHabilidad ? 1 : 0;
  const davyCartas = t.monstruos > 0 ? 1 : 0;
  const botinCartas = Math.min(2, ctx.alianzasBotin ?? 0);
  // El Kong capturado necesita además la carta que lo captura (Skull King o Sirena).
  const capturadorKong = t.kong > 0 && skCartas + sirenas === 0 ? 1 : 0;
  const palos = sinPalos
    ? 0
    : asignaciones.reduce((acc, e) => acc + PALOS.reduce((a, id) => a + (Number(e[id]) || 0), 0), 0);
  return skCartas + sirenas + piratas + kongCartas + capturadorKong + davyCartas + t.monstruos + botinCartas + palos;
}

/** ¿Entra una carta más (habilidad pirata, Kong o alianza de Botín) en la mesa de esta ronda? */
export function hayCartaLibre(ctx: ContextoLimite, extra: { habilidad?: boolean; kong?: boolean; alianza?: boolean }): boolean {
  const ctx2: ContextoLimite = {
    ...ctx,
    piratasEnHabilidades: (ctx.piratasEnHabilidades ?? 0) + (extra.habilidad ? 1 : 0),
    kongEnHabilidad: ctx.kongEnHabilidad || !!extra.kong,
    alianzasBotin: (ctx.alianzasBotin ?? 0) + (extra.alianza ? 1 : 0),
  };
  return detectarMotivoImposible(ctx.jugadores.map((j) => j.eventosBono ?? {}), ctx2) === null;
}

function detectarMotivoImposible(asignaciones: Eventos[], ctx: ContextoLimite): Motivo | null {
  const t = totalizar(asignaciones);
  const habilidades = ctx.piratasEnHabilidades ?? 0;
  const porBaza = maximoPorBaza(ctx);

  if (t.pirataSk > porBaza) return 'baza';

  // Con los 3 monstruos destruidos, Davy Jones ocupa la baza: no queda lugar para otras capturas (solo comodines).
  if (t.monstruos >= 3) {
    const otros = t.pirataSk + t.skSirena + t.sirenaPirata + t.kong + habilidades + (ctx.alianzasBotin ?? 0);
    const palos = asignaciones.reduce((acc, e) => acc + PALOS.reduce((a, id) => a + (Number(e[id]) || 0), 0), 0);
    if (otros > 0 || palos > 0) return 'davy_total';
  }

  if (t.jugadoresConPirataSk > 1 || t.skSirena > 1) return 'sk_unico';
  if (t.pirataSk > 0 && t.skSirena > 0) return 'sk_excluyente';
  const sirenas = t.skSirena + t.sirenaPirata;
  if (sirenas > 2) return 'sirenas';
  const piratas = t.pirataSk + t.sirenaPirata + habilidades;
  if (piratas > maximoPiratas(ctx.configuracion)) return 'piratas';
  if (t.kong > 1) return 'kong';
  if (t.monstruos > Math.min(monstruosEnMazo(ctx.configuracion), porBaza)) return 'monstruos';

  const fisicas = contarCartasFisicas(asignaciones, ctx);
  if (fisicas > totalCartasEnMesa(ctx)) return 'mesa';
  return null;
}

function asignacionesCon(ctx: ContextoLimite, idEvento: string, valor: number): Eventos[] {
  return ctx.jugadores.map((jugador, idx) =>
    idx === ctx.jugadorSeleccionadoIdx ? { ...(jugador.eventosBono ?? {}), [idEvento]: valor } : jugador.eventosBono ?? {}
  );
}

/** Cartas de palo capturables: solo las de las bazas ganadas y nunca más que las cartas de la mesa. */
function maximoCartasPalo(idEvento: string, ctx: ContextoLimite): number {
  const actual = ctx.jugadores[ctx.jugadorSeleccionadoIdx];
  if (!actual) return 0;
  if (ctx.jugadores.some((j) => (Number(j.eventosBono?.monstruo_davy) || 0) >= 3)) return 0;
  const capturables = Math.min(totalCartasEnMesa(ctx), actual.ganadas * (ctx.jugadores.length || 2));
  const otrasDelJugador = PALOS.filter((id) => id !== idEvento).reduce(
    (acc, id) => acc + (Number(actual.eventosBono?.[id]) || 0),
    0
  );
  const deTodos = ctx.jugadores.reduce(
    (acc, j, idx) =>
      idx === ctx.jugadorSeleccionadoIdx ? acc : acc + PALOS.reduce((a, id) => a + (Number(j.eventosBono?.[id]) || 0), 0),
    0
  );
  const especiales = contarCartasFisicas(ctx.jugadores.map((j) => j.eventosBono ?? {}), ctx, true);
  const libres = Math.max(0, totalCartasEnMesa(ctx) - especiales - deTodos - otrasDelJugador);
  return Math.max(0, Math.min(LIMITES_FIJOS[idEvento] ?? 99, capturables - otrasDelJugador, libres));
}

/**
 * Mayor valor `v` tal que la ronda completa (con lo de los demás jugadores y `v` para el jugador actual)
 * siga siendo posible. Las cartas especiales son únicas: ver `esPosibleAsignacionEspeciales`.
 */
export function calcularMaximoDisponible(idEvento: string, ctx: ContextoLimite): number {
  if (!estaDisponibleEventoBono(idEvento, ctx.configuracion)) return 0;
  if (idEvento === 'monstruo_davy' && (ctx.jugadores[ctx.jugadorSeleccionadoIdx]?.ganadas ?? 0) >= ctx.cartasPorJugadorEnRonda) return 0;
  if (idEvento === 'monstruo_davy' && ctx.cartasPorJugadorEnRonda === 1) {
    // Con una baza única, tiene que quedar una carta que la gane si alguien ya anotó una baza.
    const otrosGanaron = ctx.jugadores.some((j, i) => i !== ctx.jugadorSeleccionadoIdx && (Number(j.ganadas) || 0) > 0);
    if (otrosGanaron) return Math.max(0, Math.min(3, (ctx.jugadores.length || 2) - 2));
  }
  if ((PALOS as readonly string[]).includes(idEvento)) return maximoCartasPalo(idEvento, ctx);
  if (!(EVENTOS_ESPECIALES as readonly string[]).includes(idEvento)) return LIMITES_FIJOS[idEvento] ?? 99;

  let maximo = 0;
  for (let valor = 1; valor <= 12; valor++) {
    if (!esPosibleAsignacionEspeciales(asignacionesCon(ctx, idEvento, valor), ctx)) break;
    maximo = valor;
  }
  return maximo;
}

/** Línea corta con el motivo por el cual el + de un bono ya no se puede usar. */
export function motivoTopeBono(idEvento: string, ctx: ContextoLimite): string {
  const actual = Number(ctx.jugadores[ctx.jugadorSeleccionadoIdx]?.eventosBono?.[idEvento]) || 0;
  if (idEvento === 'monstruo_davy' && (ctx.jugadores[ctx.jugadorSeleccionadoIdx]?.ganadas ?? 0) >= ctx.cartasPorJugadorEnRonda) {
    return 'Davy Jones no gana bazas: si este jugador ganó todas las suyas, no pudo jugarlo.';
  }
  if (idEvento === 'monstruo_davy' && ctx.cartasPorJugadorEnRonda === 1 && ctx.jugadores.some((j, i) => i !== ctx.jugadorSeleccionadoIdx && (Number(j.ganadas) || 0) > 0) && actual + 1 > (ctx.jugadores.length || 2) - 2) {
    return 'Otro jugador ya ganó la baza: tiene que quedar una carta que la gane.';
  }
  const motivo = detectarMotivoImposible(asignacionesCon(ctx, idEvento, actual + 1), ctx);
  switch (motivo) {
    case 'davy_total':
      return 'Con los 3 monstruos, Davy Jones ocupa toda la baza: solo se admiten comodines.';
    case 'baza':
      return `En una baza entran ${(ctx.jugadores.length || 2)} cartas: el Skull King captura hasta ${maximoPorBaza(ctx)}.`;
    case 'sk_unico':
      return 'Ya se asignó el Skull King en esta ronda.';
    case 'sk_excluyente':
      return idEvento === 'pirata_por_sk'
        ? 'El Skull King ya fue capturado por una Sirena.'
        : 'El Skull King ya capturó piratas en esta ronda.';
    case 'sirenas':
      return 'No quedan sirenas.';
    case 'piratas':
      return 'No quedan piratas.';
    case 'kong':
      return 'Solo hay un Primer Oficial Kong.';
    case 'monstruos':
      return 'No quedan monstruos para destruir.';
    case 'mesa':
      return 'No hay más cartas en la mesa.';
    default:
      return '';
  }
}

/**
 * Corrige valores imposibles (partidas viejas, rondas editadas) tocando lo mínimo:
 * arranca sin capturas y devuelve a cada jugador, en orden, lo que todavía entra.
 */
export function sanearEventosEspeciales(jugadores: Jugador[], ctx: Omit<ContextoLimite, 'jugadores' | 'jugadorSeleccionadoIdx'>): Jugador[] {
  const trabajo: Jugador[] = jugadores.map((j) => ({ ...j, eventosBono: { ...(j.eventosBono ?? {}) } }));
  for (const j of trabajo) for (const id of EVENTOS_ESPECIALES) if (id in j.eventosBono) j.eventosBono[id] = 0;

  jugadores.forEach((original, idx) => {
    for (const id of EVENTOS_ESPECIALES) {
      const deseado = Number(original.eventosBono?.[id]) || 0;
      if (deseado <= 0) continue;
      const maximo = calcularMaximoDisponible(id, { ...ctx, jugadores: trabajo, jugadorSeleccionadoIdx: idx });
      trabajo[idx]!.eventosBono[id] = Math.min(deseado, maximo);
    }
  });
  return trabajo;
}

/**
 * Rango de puntos (en pasos de 5) del control "Puntos por cartas capturadas".
 * Solo hay tantas cartas con bonificación como cartas repartidas en la mesa.
 */
export function limitesPuntosCartas(ctx: ContextoLimite): { minimo: number; maximo: number } {
  const ganadas = ctx.jugadores[ctx.jugadorSeleccionadoIdx]?.ganadas ?? 0;
  // Solo se capturan cartas de las bazas que se ganaron (una carta por jugador en cada baza).
  const enMesa = Math.min(totalCartasEnMesa(ctx), ganadas * (ctx.jugadores.length || 2));
  const positivas = [20, 10, 10, 10];
  if (estaReglaActiva(ctx.configuracion, 'carta8')) positivas.push(5, 5, 5, 5);
  const maximo = positivas.slice(0, enMesa).reduce((acc, pts) => acc + pts, 0);
  const cantidad7 = estaReglaActiva(ctx.configuracion, 'carta7') ? Math.min(4, enMesa) : 0;
  return { minimo: -5 * cantidad7, maximo };
}
