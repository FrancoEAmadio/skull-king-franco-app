import { describe, expect, it } from 'vitest';
import { construirBarbagris, crearJugadorBarbagris } from './barbagris';
import { calcularJugadoresOrdenados } from '../features/partida/selectores';
import type { EntradaHistorialRonda } from '../tipos';

const ent = (ronda: number, ganadas: number): EntradaHistorialRonda => ({
  ronda, apuesta: 0, ganadas, acierto: true, puntajeBase: 0, totalBonos: 0,
  bonosCobradas: [], bonosNoCobradas: [], totalRonda: 0, acumuladoAnterior: 0, acumuladoNuevo: 0,
});

describe('Barbagrís', () => {
  it('solo existe con 2 jugadores', () => {
    expect(construirBarbagris([{ historial: [ent(1, 1)] }], [1])).toBeNull();
  });
  it('gana las bazas que no ganó ningún jugador y puntúa con envite 0', () => {
    const r = construirBarbagris(
      [{ historial: [ent(1, 1), ent(2, 1)] }, { historial: [ent(1, 0), ent(2, 0)] }],
      [1, 2]
    )!;
    // Ronda 1: nadie le deja baza -> acierta 0 (+10). Ronda 2: se lleva 1 baza -> falla (-20).
    expect(r.historial.map((h) => h.ganadas)).toEqual([0, 1]);
    expect(r.puntos).toBe(10 - 20);
    expect(r.historial[1]!.acumuladoNuevo).toBe(-10);
  });
});

describe('Barbagrís como jugador de la partida', () => {
  it('va siempre último en el orden de la mesa', () => {
    const ana = { ...crearJugadorBarbagris(), fantasma: false, permanenteId: 'a' };
    const beto = { ...crearJugadorBarbagris(), fantasma: false, permanenteId: 'b' };
    const orden = calcularJugadoresOrdenados([ana, beto, crearJugadorBarbagris()], 1).map((i) => i.jugador.permanenteId);
    expect(orden).toEqual(['b', 'a', 'barbagris']);
  });
});
