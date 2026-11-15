import { describe, expect, it } from 'vitest';
import { calcularMaximoDisponible, sanearEventosEspeciales } from '../src/dominio/bonos';
import type { ConfiguracionMesa, Jugador } from '../src/tipos';

const reglas = (o: Partial<ConfiguracionMesa['reglasOpcionales']> = {}) => ({
  kraken: true, ballenaBlanca: false, botin: true, primerOficialKong: true, pirataMaryThorne: false,
  mono15: false, mantarrayaMoteada: false, davyJones: true, caminarPorLaTabla: false, ultimaDescarga: false,
  carta7: true, carta8: true, cartas0y14: false, ...o,
});
const config = (modo: ConfiguracionMesa['modoContenido']): ConfiguracionMesa => ({
  modoContenido: modo, usarComodinesBonificacion: false, usarHabilidadesPiratas: true, usarModoBribon: false,
  cobrarBonosSinAcierto: false, modoReparto: 'clasico', cartasPorRonda: [1], reglasOpcionales: reglas(),
});
const jug = (eventos: Record<string, number> = {}) => ({ nombre: 'x', eventosBono: eventos }) as unknown as Jugador;
const ctx = (jugadores: Jugador[], idx: number, cartas: number, modo: ConfiguracionMesa['modoContenido'] = 'base') => ({
  jugadores, jugadorSeleccionadoIdx: idx, cartasPorJugadorEnRonda: cartas, configuracion: config(modo),
});
const cinco = (e: Record<string, number>[]) => e.map(jug);

describe('topes de cartas especiales', () => {
  it('5 jugadores ronda 1: SK 1, sirenas 2, piratas ≤ 5', () => {
    const j = cinco([{}, {}, {}, {}, {}]);
    expect(calcularMaximoDisponible('sk_por_sirena', ctx(j, 0, 1))).toBe(1);
    expect(calcularMaximoDisponible('sirena_por_pirata', ctx(j, 0, 1))).toBe(2);
    expect(calcularMaximoDisponible('pirata_por_sk', ctx(j, 0, 1))).toBeLessThanOrEqual(4);
  });
  it('la suma de especiales nunca supera las cartas en mesa', () => {
    const j = cinco([{ pirata_por_sk: 2 }, { sirena_por_pirata: 2 }, {}, {}, {}]);
    // SK(1)+2 piratas+2 sirenas+2 piratas = 7 > 5 → no se puede
    expect(calcularMaximoDisponible('sirena_por_pirata', ctx(j, 1, 1))).toBeLessThan(2);
  });
  it('dos jugadores no pueden tener pirata_por_sk', () => {
    const j = cinco([{ pirata_por_sk: 1 }, {}, {}, {}, {}]);
    expect(calcularMaximoDisponible('pirata_por_sk', ctx(j, 1, 3))).toBe(0);
  });
  it('pirata_por_sk y sk_por_sirena son excluyentes', () => {
    const j = cinco([{ pirata_por_sk: 1 }, {}, {}, {}, {}]);
    expect(calcularMaximoDisponible('sk_por_sirena', ctx(j, 1, 3))).toBe(0);
    const k = cinco([{ sk_por_sirena: 1 }, {}, {}, {}, {}]);
    expect(calcularMaximoDisponible('pirata_por_sk', ctx(k, 1, 3))).toBe(0);
  });
  it('el Skull King captura como máximo jugadores − 1 por baza (5 jugadores → 4)', () => {
    const j = cinco([{}, {}, {}, {}, {}]);
    expect(calcularMaximoDisponible('pirata_por_sk', ctx(j, 0, 2, 'expansion'))).toBe(4);
  });
  it('Davy Jones: hasta 3 monstruos con 5 jugadores', () => {
    const j = cinco([{}, {}, {}, {}, {}]);
    expect(calcularMaximoDisponible('monstruo_davy', ctx(j, 0, 2, 'expansion'))).toBe(3);
  });
  it('6 piratas en Base y 7 en Expansión (mesa de 8)', () => {
    const j = cinco([{}, {}, {}, {}, {}, {}, {}, {}]);
    expect(calcularMaximoDisponible('pirata_por_sk', ctx(j, 0, 10, 'base'))).toBe(6);
    expect(calcularMaximoDisponible('pirata_por_sk', ctx(j, 0, 10, 'expansion'))).toBe(7);
  });
  it('ronda de 1 carta con 2 jugadores', () => {
    const j = cinco([{}, {}]);
    expect(calcularMaximoDisponible('pirata_por_sk', ctx(j, 0, 1))).toBe(1);
    expect(calcularMaximoDisponible('sirena_por_pirata', ctx(j, 0, 1))).toBe(1);
  });
  it('Kong no existe fuera de Expansión', () => {
    const j = cinco([{}, {}]);
    expect(calcularMaximoDisponible('kong_por_sk_sirena', ctx(j, 0, 5, 'base'))).toBe(0);
    expect(calcularMaximoDisponible('kong_por_sk_sirena', ctx(j, 0, 5, 'expansion'))).toBe(1);
  });
  it('sanea valores imposibles de partidas viejas', () => {
    const j = cinco([{ pirata_por_sk: 3 }, { pirata_por_sk: 2, sk_por_sirena: 1 }, {}]);
    const r = sanearEventosEspeciales(j, { configuracion: config('base'), cartasPorJugadorEnRonda: 5 });
    expect(r[0]!.eventosBono.pirata_por_sk).toBe(2); // 3 jugadores → máx 2 por baza
    expect(r[1]!.eventosBono.pirata_por_sk).toBe(0);
  });
});

describe('presupuesto de cartas de la mesa', () => {
  const ganando = (e: Record<string, number>, ganadas = 1) => ({ nombre: 'x', ganadas, eventosBono: e }) as unknown as Jugador;
  it('SK con 4 piratas en 5 jugadores/1 carta agota la mesa: sin palos, Botín ni habilidades', async () => {
    const { hayCartaLibre } = await import('../src/dominio/bonos');
    const j = [ganando({ pirata_por_sk: 4 }), ganando({}, 0), ganando({}, 0), ganando({}, 0), ganando({}, 0)];
    const c = ctx(j, 0, 1, 'expansion');
    expect(calcularMaximoDisponible('catorce_color', c)).toBe(0);
    expect(calcularMaximoDisponible('catorce_negro', c)).toBe(0);
    expect(calcularMaximoDisponible('siete_expansion', c)).toBe(0);
    expect(hayCartaLibre(c, { alianza: true })).toBe(false);
    expect(hayCartaLibre(c, { habilidad: true })).toBe(false);
  });
  it('con una carta libre todavía entra un palo', () => {
    const j = [ganando({ pirata_por_sk: 2 }), ganando({}, 0), ganando({}, 0), ganando({}, 0), ganando({}, 0)];
    expect(calcularMaximoDisponible('catorce_color', ctx(j, 0, 1, 'expansion'))).toBeGreaterThan(0);
  });
});
