import { describe, expect, it } from 'vitest';
import { normalizarColores, PALETA_JUGADOR } from './coloresJugador';
import { crearJugadorPermanente } from '../dominio/estadisticas';

const jugadores = (n: number) => Array.from({ length: n }, (_, i) => crearJugadorPermanente(`J${i}`));

describe('colores de jugador', () => {
  it('asigna colores de tarjeta distintos y el fondo nunca iguala a la tarjeta', () => {
    const { lista } = normalizarColores(jugadores(9));
    expect(new Set(lista.map((j) => j.colorTarjeta)).size).toBe(9);
    expect(lista.every((j) => j.colorAvatar !== j.colorTarjeta)).toBe(true);
    expect(PALETA_JUGADOR).toHaveLength(9);
  });

  it('si otro jugador ya tenía el color elegido, ese otro cambia solo', () => {
    const base = normalizarColores(jugadores(3)).lista;
    const [a, b, c] = base;
    const cambio = base.map((j) => (j.id === c!.id ? { ...j, colorTarjeta: a!.colorTarjeta } : j));
    const { lista } = normalizarColores(cambio, c!.id);
    expect(lista.find((j) => j.id === c!.id)!.colorTarjeta).toBe(a!.colorTarjeta);
    expect(lista.find((j) => j.id === a!.id)!.colorTarjeta).not.toBe(a!.colorTarjeta);
    expect(new Set(lista.map((j) => j.colorTarjeta)).size).toBe(3);
    expect(lista.find((j) => j.id === b!.id)!.colorTarjeta).toBe(b!.colorTarjeta);
  });
});
