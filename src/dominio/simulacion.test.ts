/**
 * Simulación: juega miles de rondas inventadas al azar (con una semilla fija, así los fallos se pueden repetir)
 * y revisa reglas que nunca deberían romperse, pase lo que pase con las cartas, los envites y los bonos.
 */
import { describe, expect, it } from 'vitest';
import {
  calcularMaximoDisponible,
  contarCartasFisicas,
  esPosibleAsignacionEspeciales,
  totalCartasEnMesa,
  EVENTOS_ESPECIALES,
  type ContextoLimite,
} from './bonos';
import { cerrarRonda } from './cierreRonda';
import { calcularPuntajeRonda } from './puntuacion';
import type { AlianzaBotin, ConfiguracionMesa, Jugador, ModoContenido } from '../tipos';

// ---------- azar con semilla ----------
function crearAzar(semilla: number) {
  let s = semilla >>> 0;
  const siguiente = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    entero: (min: number, max: number) => min + Math.floor(siguiente() * (max - min + 1)),
    elegir: <T,>(lista: readonly T[]): T => lista[Math.floor(siguiente() * lista.length)]!,
    moneda: (p = 0.5) => siguiente() < p,
  };
}

// ---------- armado de mesas ----------
const EVENTOS = [
  'pirata_por_sk',
  'sk_por_sirena',
  'sirena_por_pirata',
  'catorce_negro',
  'catorce_color',
  'ocho_expansion',
  'siete_expansion',
  'monstruo_davy',
  'kong_por_sk_sirena',
] as const;

function configuracion(azar: ReturnType<typeof crearAzar>): ConfiguracionMesa {
  const modo: ModoContenido = azar.elegir(['base', 'avanzado', 'expansion'] as const);
  return {
    modoContenido: modo,
    usarComodinesBonificacion: false,
    usarHabilidadesPiratas: azar.moneda(),
    usarModoBribon: false,
    cobrarBonosSinAcierto: azar.moneda(),
    modoReparto: 'clasico',
    cartasPorRonda: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    reglasOpcionales: {
      kraken: azar.moneda(0.8),
      ballenaBlanca: azar.moneda(0.5),
      botin: azar.moneda(0.8),
      primerOficialKong: azar.moneda(0.8),
      pirataMaryThorne: false,
      mono15: false,
      mantarrayaMoteada: azar.moneda(0.5),
      davyJones: azar.moneda(0.8),
      caminarPorLaTabla: false,
      ultimaDescarga: false,
      carta7: azar.moneda(0.8),
      carta8: azar.moneda(0.8),
      cartas0y14: false,
    },
  };
}

function jugadorVacio(i: number): Jugador {
  return {
    permanenteId: `p${i}`,
    nombre: `Jugador ${i + 1}`,
    puntos: 0,
    apuesta: 0,
    ganadas: 0,
    modoEnvite: 'metralla',
    bribonHabilidadPts: null,
    bribonStolenFrom: null,
    eventosBono: {},
    cartasBlancas: 0,
    apuestasAcertadas: 0,
    apuestasFalladas: 0,
    capturasSkullKing: 0,
    capturasSirena: 0,
    capturasMonstruo: 0,
    historial: [],
  };
}

interface Ronda {
  ctx: ContextoLimite;
  config: ConfiguracionMesa;
  cartas: number;
}

/** Arma una ronda con envites, bazas ganadas y capturas cargadas como lo haría la app (respetando el máximo permitido). */
function rondaAlAzar(azar: ReturnType<typeof crearAzar>): Ronda {
  const config = configuracion(azar);
  const n = azar.entero(2, 8);
  const cartas = azar.entero(1, 10);
  const jugadores = Array.from({ length: n }, (_, i) => jugadorVacio(i));

  // Las bazas se reparten entre los jugadores: en total hay `cartas` bazas.
  for (let b = 0; b < cartas; b++) jugadores[azar.entero(0, n - 1)]!.ganadas++;
  jugadores.forEach((j) => {
    j.apuesta = azar.moneda(0.6) ? j.ganadas : azar.entero(0, cartas);
  });

  const ctx: ContextoLimite = { jugadores, jugadorSeleccionadoIdx: 0, configuracion: config, cartasPorJugadorEnRonda: cartas };
  // Carga de capturas en orden aleatorio, siempre dentro de lo que la app deja.
  const pasos = azar.entero(0, 40);
  for (let k = 0; k < pasos; k++) {
    const idx = azar.entero(0, n - 1);
    const id = azar.elegir(EVENTOS);
    ctx.jugadorSeleccionadoIdx = idx;
    const max = calcularMaximoDisponible(id, ctx);
    const actual = Number(jugadores[idx]!.eventosBono[id]) || 0;
    if (max > actual && azar.moneda(0.8)) jugadores[idx]!.eventosBono = { ...jugadores[idx]!.eventosBono, [id]: actual + 1 };
    else if (actual > 0 && azar.moneda(0.3)) jugadores[idx]!.eventosBono = { ...jugadores[idx]!.eventosBono, [id]: actual - 1 };
  }
  return { ctx, config, cartas };
}

declare const process: { env: Record<string, string | undefined> };
const ITERACIONES = Number(process.env.SIM_ITER) || 4000;
const SEMILLA = Number(process.env.SIM_SEMILLA) || 0;

describe('simulación de rondas al azar', () => {
  it('lo que la app deja cargar es siempre una ronda físicamente posible', () => {
    const azar = crearAzar(1 + SEMILLA * 100);
    for (let i = 0; i < ITERACIONES; i++) {
      const { ctx } = rondaAlAzar(azar);
      const asign = ctx.jugadores.map((j) => j.eventosBono);
      const detalle = JSON.stringify({ i, cartas: ctx.cartasPorJugadorEnRonda, n: ctx.jugadores.length, asign, modo: ctx.configuracion.modoContenido });
      expect(esPosibleAsignacionEspeciales(asign, ctx), detalle).toBe(true);
      expect(contarCartasFisicas(asign, ctx), detalle).toBeLessThanOrEqual(totalCartasEnMesa(ctx));
    }
  });

  it('nada de lo ya cargado supera el máximo que la app calcula para ese mismo botón (si no, el valor se "borra" solo)', () => {
    const azar = crearAzar(2 + SEMILLA * 100);
    for (let i = 0; i < ITERACIONES; i++) {
      const { ctx } = rondaAlAzar(azar);
      ctx.jugadores.forEach((j, idx) => {
        for (const id of EVENTOS) {
          const actual = Number(j.eventosBono[id]) || 0;
          if (actual === 0) continue;
          const max = calcularMaximoDisponible(id, { ...ctx, jugadorSeleccionadoIdx: idx });
          expect(
            actual,
            JSON.stringify({ i, jugador: idx, id, actual, max, ganadas: j.ganadas, cartas: ctx.cartasPorJugadorEnRonda, n: ctx.jugadores.length, asign: ctx.jugadores.map((x) => x.eventosBono) })
          ).toBeLessThanOrEqual(max);
        }
      });
    }
  });

  it('bajar una captura nunca vuelve imposible la ronda', () => {
    const azar = crearAzar(3 + SEMILLA * 100);
    for (let i = 0; i < ITERACIONES / 2; i++) {
      const { ctx } = rondaAlAzar(azar);
      ctx.jugadores.forEach((j, idx) => {
        for (const id of EVENTOS) {
          const actual = Number(j.eventosBono[id]) || 0;
          if (actual === 0) continue;
          const asign = ctx.jugadores.map((x, k) => (k === idx ? { ...x.eventosBono, [id]: actual - 1 } : x.eventosBono));
          expect(esPosibleAsignacionEspeciales(asign, ctx), JSON.stringify({ i, idx, id, asign })).toBe(true);
        }
      });
    }
  });

  it('cerrar la ronda: el total es base + bonos, los acumulados suman bien y no se modifican los datos de entrada', () => {
    const azar = crearAzar(4 + SEMILLA * 100);
    for (let i = 0; i < ITERACIONES / 2; i++) {
      const { ctx, config, cartas } = rondaAlAzar(azar);
      const n = ctx.jugadores.length;
      const alianzas: AlianzaBotin[] = [];
      const cantAlianzas = azar.entero(0, 2);
      for (let a = 0; a < cantAlianzas && n >= 2; a++) {
        const idxA = azar.entero(0, n - 1);
        let idxB = azar.entero(0, n - 1);
        if (idxB === idxA) idxB = (idxA + 1) % n;
        alianzas.push({ idxA, idxB, nombreA: ctx.jugadores[idxA]!.nombre, nombreB: ctx.jugadores[idxB]!.nombre });
      }
      const antes = JSON.stringify(ctx.jugadores);
      const r = cerrarRonda({ jugadores: ctx.jugadores, configuracion: config, alianzas, habilidades: [], ronda: 1, cartasPorJugadorEnRonda: cartas }, false);
      expect(JSON.stringify(ctx.jugadores), 'cerrarRonda modificó los jugadores de entrada').toBe(antes);

      r.jugadores.forEach((j, idx) => {
        const e = j.historial[0]!;
        const detalle = JSON.stringify({ i, idx, e, config: config.modoContenido, alianzas });
        expect(e.totalRonda, detalle).toBe(e.puntajeBase + e.totalBonos);
        expect(j.puntos, detalle).toBe(e.totalRonda);
        expect(e.acumuladoNuevo, detalle).toBe(j.puntos);
        expect(j.apuestasAcertadas + j.apuestasFalladas, detalle).toBe(1);
        expect(r.resumen[idx]!.nombre).toBe(j.nombre);
      });
    }
  });

  it('el puntaje base coincide con la regla del manual (calculado aparte)', () => {
    const azar = crearAzar(5 + SEMILLA * 100);
    for (let i = 0; i < 5000; i++) {
      const ronda = azar.entero(1, 10);
      const apuesta = azar.entero(0, ronda);
      const ganadas = azar.entero(0, ronda);
      const r = calcularPuntajeRonda({
        apuesta, ganadas, numeroRonda: ronda, eventosBono: {}, usarModoBribon: false, modoEnvite: 'metralla', bribonHabilidadPts: null, cobrarBonosSinAcierto: false,
      });
      // Manual: apuesta 0 acertada = 10 × ronda; fallada = −10 × ronda. Apuesta ≥ 1 acertada = 20 por baza; fallada = −10 por cada baza de diferencia.
      const esperado =
        apuesta === 0
          ? ganadas === 0 ? 10 * ronda : -10 * ronda
          : apuesta === ganadas ? 20 * apuesta : -10 * Math.abs(apuesta - ganadas);
      expect(r.puntajeBase, JSON.stringify({ ronda, apuesta, ganadas })).toBe(esperado);
    }
  });

  it('los bonos solo se cobran si se acertó (salvo que la mesa cobre siempre)', () => {
    const azar = crearAzar(6 + SEMILLA * 100);
    for (let i = 0; i < 3000; i++) {
      const ronda = azar.entero(1, 10);
      const apuesta = azar.entero(0, ronda);
      const ganadas = azar.entero(0, ronda);
      const cobrar = azar.moneda();
      const r = calcularPuntajeRonda({
        apuesta, ganadas, numeroRonda: ronda, eventosBono: { catorce_negro: 1, pirata_por_sk: 2 }, usarModoBribon: false, modoEnvite: 'metralla', bribonHabilidadPts: null, cobrarBonosSinAcierto: cobrar,
      });
      const bonos = apuesta === ganadas || cobrar ? 20 + 60 : 0;
      expect(r.totalBonos, JSON.stringify({ apuesta, ganadas, cobrar })).toBe(bonos);
    }
  });

  it('las cartas del mazo no se repiten entre jugadores (un solo Skull King, Kong y 14 negro, etc.)', () => {
    const azar = crearAzar(7 + SEMILLA * 100);
    for (let i = 0; i < ITERACIONES; i++) {
      const { ctx } = rondaAlAzar(azar);
      const suma = (id: string) => ctx.jugadores.reduce((a, j) => a + (Number(j.eventosBono[id]) || 0), 0);
      const detalle = JSON.stringify({ i, asign: ctx.jugadores.map((j) => j.eventosBono) });
      expect(suma('sk_por_sirena'), detalle).toBeLessThanOrEqual(1);
      expect(suma('kong_por_sk_sirena'), detalle).toBeLessThanOrEqual(1);
      expect(suma('catorce_negro'), detalle).toBeLessThanOrEqual(1);
      expect(suma('catorce_color'), detalle).toBeLessThanOrEqual(3);
      expect(suma('ocho_expansion'), detalle).toBeLessThanOrEqual(4);
      expect(suma('siete_expansion'), detalle).toBeLessThanOrEqual(4);
      expect(suma('monstruo_davy'), detalle).toBeLessThanOrEqual(3);
      expect(ctx.jugadores.filter((j) => (Number(j.eventosBono.monstruo_davy) || 0) > 0).length, detalle).toBeLessThanOrEqual(1);
      expect(suma('sirena_por_pirata') + suma('sk_por_sirena'), detalle).toBeLessThanOrEqual(2);
      void EVENTOS_ESPECIALES;
    }
  });
});

describe('casos límite fijos', () => {
  it('con más alianzas que el máximo, el detalle de bonos y el total de la ronda coinciden', () => {
    const jugadores = [0, 1, 2].map((i) => ({ ...jugadorVacio(i), apuesta: 1, ganadas: 1 }));
    const alianzas: AlianzaBotin[] = [
      { idxA: 0, idxB: 1, nombreA: 'a', nombreB: 'b' },
      { idxA: 1, idxB: 2, nombreA: 'b', nombreB: 'c' },
      { idxA: 0, idxB: 2, nombreA: 'a', nombreB: 'c' },
    ];
    const config = configuracion(crearAzar(99));
    config.modoContenido = 'avanzado';
    config.reglasOpcionales.botin = true;
    const r = cerrarRonda({ jugadores, configuracion: config, alianzas, habilidades: [], ronda: 1, cartasPorJugadorEnRonda: 1 }, false);
    r.jugadores.forEach((j) => {
      const e = j.historial[0]!;
      expect(e.totalRonda, JSON.stringify(e)).toBe(e.puntajeBase + e.totalBonos);
    });
  });
});
