/**
 * Datos viejos o rotos: lo guardado por versiones anteriores (o a medias) nunca debe tirar abajo la app.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cargarHistorial,
  cargarJugadoresPermanentes,
  cargarPartidasGuardadas,
  crearCopiaSeguridad,
  interpretarCopiaSeguridad,
} from './almacenamiento';
import { CLAVE_LS_HISTORIAL, CLAVE_LS_JUGADORES_PERMANENTES, CLAVE_LS_PARTIDAS, CLAVE_LS_PARTIDA_GUARDADA } from '../constantes';

function instalarLocalStorage(datos: Record<string, string>) {
  const almacen = new Map(Object.entries(datos));
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => almacen.get(k) ?? null,
    setItem: (k: string, v: string) => void almacen.set(k, String(v)),
    removeItem: (k: string) => void almacen.delete(k),
    clear: () => almacen.clear(),
  });
}

function crearAzar(semilla: number) {
  let s = semilla >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Valores raros que podrían haber quedado guardados. */
function valorRaro(azar: () => number, profundidad = 0): unknown {
  const r = azar();
  if (r < 0.1) return null;
  if (r < 0.2) return 'texto';
  if (r < 0.3) return -3;
  if (r < 0.4) return {};
  if (r < 0.5) return [];
  if (r < 0.6 || profundidad > 2) return true;
  if (r < 0.8) return Array.from({ length: Math.floor(azar() * 4) }, () => valorRaro(azar, profundidad + 1));
  const o: Record<string, unknown> = {};
  for (const k of ['id', 'nombre', 'jugadores', 'historial', 'ranking', 'puntos', 'fecha', 'ronda', 'avatar', 'estadisticas', 'actualizada', 'config']) {
    if (azar() < 0.4) o[k] = valorRaro(azar, profundidad + 1);
  }
  return o;
}

describe('datos viejos o rotos en localStorage', () => {
  beforeEach(() => instalarLocalStorage({}));

  it('JSON inválido: se carga vacío, sin errores', () => {
    instalarLocalStorage({
      [CLAVE_LS_JUGADORES_PERMANENTES]: '{no es json',
      [CLAVE_LS_HISTORIAL]: '<<<',
      [CLAVE_LS_PARTIDAS]: 'undefined',
      [CLAVE_LS_PARTIDA_GUARDADA]: '[[[',
    });
    expect(cargarJugadoresPermanentes()).toEqual([]);
    expect(cargarHistorial()).toEqual([]);
    expect(cargarPartidasGuardadas()).toEqual([]);
  });

  it('miles de combinaciones de datos raros nunca rompen la carga', () => {
    const azar = crearAzar(11);
    for (let i = 0; i < 3000; i++) {
      instalarLocalStorage({
        [CLAVE_LS_JUGADORES_PERMANENTES]: JSON.stringify(valorRaro(azar)),
        [CLAVE_LS_HISTORIAL]: JSON.stringify(valorRaro(azar)),
        [CLAVE_LS_PARTIDAS]: JSON.stringify(valorRaro(azar)),
        [CLAVE_LS_PARTIDA_GUARDADA]: JSON.stringify(valorRaro(azar)),
      });
      const contexto = `iteración ${i}`;
      expect(() => cargarJugadoresPermanentes(), contexto).not.toThrow();
      expect(() => cargarHistorial(), contexto).not.toThrow();
      expect(() => cargarPartidasGuardadas(), contexto).not.toThrow();
      expect(Array.isArray(cargarJugadoresPermanentes()), contexto).toBe(true);
      expect(Array.isArray(cargarHistorial()), contexto).toBe(true);
    }
  });

  it('importar copias de seguridad rotas o raras devuelve un aviso, nunca una excepción', () => {
    const azar = crearAzar(12);
    for (let i = 0; i < 3000; i++) {
      const texto = azar() < 0.2 ? 'no json' : JSON.stringify({ app: 'skull-king', version: 1, jugadores: valorRaro(azar), historial: valorRaro(azar) });
      expect(() => interpretarCopiaSeguridad(texto), `iteración ${i}: ${texto.slice(0, 120)}`).not.toThrow();
      expect(() => interpretarCopiaSeguridad(JSON.stringify(valorRaro(azar)))).not.toThrow();
    }
  });

  it('una copia de seguridad exportada se puede volver a importar sin perder nada', () => {
    const jugadores = [{ id: 'a', nombre: 'Ana', avatar: '🦜', creado: '2026-01-01', estadisticas: {} }] as never;
    const copia = crearCopiaSeguridad(jugadores, []);
    const r = interpretarCopiaSeguridad(JSON.stringify(copia));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.copia.jugadores[0]!.nombre).toBe('Ana');
  });
});

describe('partidas guardadas con campos que faltan (versiones viejas)', () => {
  const base = () => ({
    id: 'p1',
    actualizada: '2026-11-01T00:00:00.000Z',
    jugadores: [
      { permanenteId: 'a', nombre: 'A', puntos: 0, apuesta: 0, ganadas: 0, modoEnvite: 'normal', bribonHabilidadPts: null, bribonStolenFrom: null, eventosBono: {}, fecha: '', historial: [] },
    ],
    rondaActual: 1,
    configuracionMesa: { reglasOpcionales: {} },
    alianzasBotinRonda: [],
    jugadorSeleccionadoIdx: 0,
    registroHabilidadesRonda: [],
    cartasPorRondaActivas: [1, 2, 3],
    pasoPartida: 'apuestas',
    resumenRondaActual: [],
    editandoRondaAnterior: false,
    backupRondaActual: null,
    ultimaRondaEditable: null,
    partidaPendienteFinalizar: false,
  });

  it('sin cualquiera de sus campos, la partida carga con todo lo que usa la pantalla definido', () => {
    for (const campo of Object.keys(base())) {
      const partida = base() as Record<string, unknown>;
      delete partida[campo];
      instalarLocalStorage({ [CLAVE_LS_PARTIDAS]: JSON.stringify([partida]) });
      const cargadas = cargarPartidasGuardadas();
      if (campo === 'jugadores') {
        expect(cargadas, campo).toHaveLength(0);
        continue;
      }
      expect(cargadas, campo).toHaveLength(1);
      const p = cargadas[0]!;
      expect(Array.isArray(p.cartasPorRondaActivas), campo).toBe(true);
      expect(Array.isArray(p.alianzasBotinRonda), campo).toBe(true);
      expect(Array.isArray(p.registroHabilidadesRonda), campo).toBe(true);
      expect(Array.isArray(p.resumenRondaActual), campo).toBe(true);
      expect(typeof p.configuracionMesa, campo).toBe('object');
    }
  });

  it('un jugador sin historial ni bonos no rompe', () => {
    const partida = base();
    delete (partida.jugadores[0] as Record<string, unknown>).historial;
    delete (partida.jugadores[0] as Record<string, unknown>).eventosBono;
    instalarLocalStorage({ [CLAVE_LS_PARTIDAS]: JSON.stringify([partida]) });
    const j = cargarPartidasGuardadas()[0]!.jugadores[0]!;
    expect(j.historial).toEqual([]);
    expect(j.eventosBono).toEqual({});
  });

  it('un historial viejo con filas sin historial de rondas carga completo', () => {
    instalarLocalStorage({
      [CLAVE_LS_HISTORIAL]: JSON.stringify([{ fecha: '01/11/2026', ranking: [{ nombre: 'A', puntos: 10 }] }]),
    });
    const h = cargarHistorial();
    expect(h).toHaveLength(1);
    expect(h[0]!.ranking[0]!.historial).toEqual([]);
  });
});
