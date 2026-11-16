import { describe, expect, it } from 'vitest';
import { calcularMaximoDisponible, motivoTopeBono, type ContextoLimite } from './bonos';

const jugador = (nombre: string, ganadas: number, eventosBono: Record<string, number> = {}) =>
  ({ nombre, ganadas, eventosBono }) as never;

const ctxBase = (jugadores: ContextoLimite['jugadores'], idx: number): ContextoLimite => ({
  jugadores,
  jugadorSeleccionadoIdx: idx,
  cartasPorJugadorEnRonda: 1,
  configuracion: {
    modoContenido: 'expansion',
    reglasOpcionales: { davyJones: true, kraken: true, ballenaBlanca: true, mantarrayaMoteada: true, carta8: true, carta7: true },
  } as never,
});

describe('cartas de la mesa agotadas', () => {
  // 3 jugadores, 1 carta cada uno: en la mesa hay 3 cartas. Lady ganó la baza y capturó 3 ochos.
  const jugadores = [jugador('Eisenag', 0), jugador('Martina', 0), jugador('Lady', 1, { ocho_expansion: 3 })];

  it('si ya se capturaron las 3 cartas, nadie más puede registrar un monstruo de Davy Jones', () => {
    expect(calcularMaximoDisponible('monstruo_davy', ctxBase(jugadores, 0))).toBe(0);
    expect(calcularMaximoDisponible('monstruo_davy', ctxBase(jugadores, 1))).toBe(0);
    expect(motivoTopeBono('monstruo_davy', ctxBase(jugadores, 1))).toBe('No hay más cartas en la mesa.');
  });

  it('si todavía queda lugar en la mesa, Davy Jones sigue disponible', () => {
    const libres = [jugador('Eisenag', 0), jugador('Martina', 0), jugador('Lady', 1)];
    expect(calcularMaximoDisponible('monstruo_davy', ctxBase(libres, 0))).toBe(1);
  });
});
