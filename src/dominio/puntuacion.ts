import { LISTA_EVENTOS_BONO } from '../datos/cartasDatos';
import type { ModoEnvite } from '../tipos';

export interface EntradaCalculoRonda {
  apuesta: number;
  ganadas: number;
  numeroRonda: number;
  eventosBono: Record<string, number>;
  usarModoBribon: boolean;
  modoEnvite: ModoEnvite;
  bribonHabilidadPts: number | null;
  cobrarBonosSinAcierto: boolean;
}

export interface ResultadoRonda {
  acierto: boolean;
  puntajeBase: number;
  totalBonos: number;
  puntajeTotal: number;
}

function calcularPuntajeBaseEstandar(apuesta: number, ganadas: number, numeroRonda: number, acierto: boolean): number {
  if (apuesta === 0) {
    return acierto ? 10 * numeroRonda : -10 * numeroRonda;
  }
  return acierto ? 20 * ganadas : -10 * Math.abs(apuesta - ganadas);
}

function calcularPuntajeBaseBribon(numeroRonda: number, modoEnvite: ModoEnvite, acierto: boolean): number {
  if (modoEnvite === 'bala') {
    return acierto ? 15 * numeroRonda : 0;
  }
  return acierto ? 10 * numeroRonda : 5 * numeroRonda;
}

function calcularBonosDeEventos(eventosBono: Record<string, number>): number {
  let total = 0;
  for (const evId of Object.keys(eventosBono)) {
    if (evId === 'alianza_botin') continue;
    const cantidad = Number(eventosBono[evId]) || 0;
    if (cantidad <= 0) continue;
    const regla = LISTA_EVENTOS_BONO.find((r) => r.id === evId);
    if (regla) total += cantidad * regla.puntos;
  }
  return total;
}

// El Bribón de Roatán resta al fallar: la apuesta de puntos es simétrica.
function calcularAjusteBribon(bribonHabilidadPts: number | null, acierto: boolean): number {
  if (bribonHabilidadPts === null || bribonHabilidadPts === undefined) return 0;
  const pts = Number(bribonHabilidadPts);
  if (isNaN(pts) || pts <= 0) return 0;
  return acierto ? pts : -pts;
}

export function calcularPuntajeRonda(entrada: EntradaCalculoRonda): ResultadoRonda {
  const {
    apuesta,
    ganadas,
    numeroRonda,
    eventosBono,
    usarModoBribon,
    modoEnvite,
    bribonHabilidadPts,
    cobrarBonosSinAcierto,
  } = entrada;

  const acierto = apuesta === ganadas;

  const puntajeBase = usarModoBribon
    ? calcularPuntajeBaseBribon(numeroRonda, modoEnvite, acierto)
    : calcularPuntajeBaseEstandar(apuesta, ganadas, numeroRonda, acierto);

  const puedeCobrarBonos = acierto || cobrarBonosSinAcierto;
  const bonosDeEventos = puedeCobrarBonos ? calcularBonosDeEventos(eventosBono) : 0;
  const ajusteBribon = calcularAjusteBribon(bribonHabilidadPts, acierto);

  const totalBonos = bonosDeEventos + ajusteBribon;

  return {
    acierto,
    puntajeBase,
    totalBonos,
    puntajeTotal: puntajeBase + totalBonos,
  };
}

export function calcularBonoCartasBlancas(cantidad: number): number {
  const c = Number(cantidad) || 0;
  if (c <= 0) return 0;
  if (c === 1) return 5;
  if (c === 2) return 10;
  if (c === 3) return 20;
  return 50;
}
