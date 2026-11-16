import { describe, expect, it } from 'vitest';
import { sincronizarHistorial, sincronizarPartida } from './sincronizarJugador';
import type { EntradaHistorialPartida } from '../tipos';

const ref = { id: 'p1', nombreViejo: 'Jugador 1', cambios: { nombre: 'Franco', avatar: '🦜' } };

describe('sincronizar tarjeta de jugador', () => {
  it('actualiza nombre e icono en la partida, alianzas y resumen', () => {
    const partida = {
      jugadores: [
        { permanenteId: 'p1', nombre: 'Jugador 1', puntos: 0 },
        { permanenteId: 'p2', nombre: 'Ana', puntos: 0 },
      ],
      alianzasBotinRonda: [{ idxA: 0, idxB: 1, nombreA: 'Jugador 1', nombreB: 'Ana' }],
      registroHabilidadesRonda: [],
      resumenRondaActual: [{ nombre: 'Jugador 1' }, { nombre: 'Ana' }] as never,
      backupRondaActual: null,
      ultimaRondaEditable: null,
    };
    const r = sincronizarPartida(partida as unknown as Parameters<typeof sincronizarPartida>[0], ref);
    expect(r.jugadores[0]).toMatchObject({ nombre: 'Franco', avatar: '🦜' });
    expect(r.jugadores[1]!.nombre).toBe('Ana');
    expect(r.alianzasBotinRonda[0]).toMatchObject({ nombreA: 'Franco', nombreB: 'Ana' });
    expect(r.resumenRondaActual[0]!.nombre).toBe('Franco');
  });

  it('actualiza el historial por id y, en partidas viejas, por nombre', () => {
    const hist = [
      { fecha: 'x', ranking: [{ permanenteId: 'p1', nombre: 'Jugador 1', puntos: 1, historial: [] }, { permanenteId: 'p2', nombre: 'Ana', puntos: 0, historial: [] }] },
      { fecha: 'y', ranking: [{ nombre: 'jugador 1', puntos: 1, historial: [] }] },
    ] as EntradaHistorialPartida[];
    const r = sincronizarHistorial(hist, ref);
    expect(r[0]!.ranking[0]!.nombre).toBe('Franco');
    expect(r[0]!.ranking[1]!.nombre).toBe('Ana');
    expect(r[1]!.ranking[0]).toMatchObject({ nombre: 'Franco', permanenteId: 'p1' });
  });
});
