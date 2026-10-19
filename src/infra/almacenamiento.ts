import {
  CLAVE_LS_HISTORIAL,
  CLAVE_LS_JUGADORES_PERMANENTES,
  CLAVE_LS_PARTIDA_GUARDADA,
} from '../constantes';
import { MAX_PARTIDAS_EVOLUCION } from '../constantes';
import { crearEstadisticasVacias } from '../dominio/estadisticas';
import type {
  EntradaEvolucion,
  EntradaHistorialPartida,
  EntradaHistorialRonda,
  EstadisticasJugador,
  JugadorPermanente,
  PartidaGuardada,
  RankingJugador,
} from '../tipos';

function leerJson<T>(clave: string): T | null {
  const crudo = localStorage.getItem(clave);
  if (!crudo) return null;
  try {
    return JSON.parse(crudo) as T;
  } catch {
    return null;
  }
}

function escribirJson(clave: string, valor: unknown): void {
  localStorage.setItem(clave, JSON.stringify(valor));
}

export function cargarJugadoresPermanentes(): JugadorPermanente[] {
  const lista = leerJson<JugadorPermanente[]>(CLAVE_LS_JUGADORES_PERMANENTES);
  return Array.isArray(lista) ? lista : [];
}

export function guardarJugadoresPermanentes(lista: JugadorPermanente[]): void {
  escribirJson(CLAVE_LS_JUGADORES_PERMANENTES, lista);
}

export function cargarHistorial(): EntradaHistorialPartida[] {
  const lista = leerJson<EntradaHistorialPartida[]>(CLAVE_LS_HISTORIAL);
  return Array.isArray(lista) ? lista : [];
}

export function guardarHistorial(historial: EntradaHistorialPartida[]): void {
  escribirJson(CLAVE_LS_HISTORIAL, historial);
}

export function borrarHistorial(): void {
  localStorage.removeItem(CLAVE_LS_HISTORIAL);
}

export function cargarPartidaGuardada(): PartidaGuardada | null {
  const partida = leerJson<PartidaGuardada & { configuracionMesa?: { reglasOpcionales?: Record<string, unknown> } }>(
    CLAVE_LS_PARTIDA_GUARDADA
  );
  if (!partida) return null;

  // Migración defensiva del campo obsoleto reglasOpcionales.cartas7y8
  if (partida.configuracionMesa?.reglasOpcionales) {
    delete (partida.configuracionMesa.reglasOpcionales as Record<string, unknown>).cartas7y8;
  }

  partida.ultimaRondaEditable ??= null;
  partida.partidaPendienteFinalizar ??= false;

  if (partida.backupRondaActual) {
    const backup = partida.backupRondaActual;
    backup.jugadoresEstado = backup.jugadoresEstado.map((jugador, indice) => ({
      ...jugador,
      cartasBlancas: jugador.cartasBlancas ?? partida.jugadores[indice]?.cartasBlancas ?? 0,
      incrementoCartasBlancas: jugador.incrementoCartasBlancas ?? 0,
    }));
    backup.jugadoresCompletos ??= partida.jugadores.map((jugador, indice) => {
      const entrada = backup.jugadoresEstado[indice];
      return entrada
        ? {
            ...jugador,
            ...entrada,
            eventosBono: { ...entrada.eventosBono },
          }
        : jugador;
    });
    backup.alianzasBotinRonda ??= [];
    backup.registroHabilidadesRonda ??= [];
    backup.resumenRondaActual ??= [];
  }

  return partida as PartidaGuardada;
}

export function guardarPartida(partida: PartidaGuardada): void {
  escribirJson(CLAVE_LS_PARTIDA_GUARDADA, partida);
}

export function borrarPartidaGuardada(): void {
  localStorage.removeItem(CLAVE_LS_PARTIDA_GUARDADA);
}

// ── Copia de seguridad (exportar / importar) ────────────────────────────

export const APP_COPIA_SEGURIDAD = 'skull-king-franco-app';
export const VERSION_COPIA_SEGURIDAD = 1;
const TAMANO_MAXIMO_COPIA_BYTES = 8 * 1024 * 1024;

export interface CopiaSeguridad {
  app: typeof APP_COPIA_SEGURIDAD;
  version: number;
  exportada: string;
  jugadores: JugadorPermanente[];
  historial: EntradaHistorialPartida[];
}

export type ResultadoInterpretacion =
  | { ok: true; copia: CopiaSeguridad; descartados: number }
  | { ok: false; motivo: string };

export function crearCopiaSeguridad(
  jugadores: JugadorPermanente[],
  historial: EntradaHistorialPartida[]
): CopiaSeguridad {
  return {
    app: APP_COPIA_SEGURIDAD,
    version: VERSION_COPIA_SEGURIDAD,
    exportada: new Date().toISOString(),
    jugadores,
    historial,
  };
}

const esObjeto = (valor: unknown): valor is Record<string, unknown> =>
  typeof valor === 'object' && valor !== null && !Array.isArray(valor);

const numeroSeguro = (valor: unknown, defecto = 0): number =>
  typeof valor === 'number' && Number.isFinite(valor) ? valor : defecto;

function normalizarEstadisticas(crudo: unknown): EstadisticasJugador {
  const base = crearEstadisticasVacias();
  if (!esObjeto(crudo)) return base;
  const nullableNum = (valor: unknown) =>
    typeof valor === 'number' && Number.isFinite(valor) ? valor : null;
  return {
    partidasJugadas: numeroSeguro(crudo.partidasJugadas),
    victorias: numeroSeguro(crudo.victorias),
    segundoPuesto: numeroSeguro(crudo.segundoPuesto),
    tercerPuesto: numeroSeguro(crudo.tercerPuesto),
    sumaPuntos: numeroSeguro(crudo.sumaPuntos),
    mejorPartida: nullableNum(crudo.mejorPartida),
    peorPartida: nullableNum(crudo.peorPartida),
    apuestasAcertadas: numeroSeguro(crudo.apuestasAcertadas),
    apuestasFalladas: numeroSeguro(crudo.apuestasFalladas),
    capturasSkullKing: numeroSeguro(crudo.capturasSkullKing),
    capturasSirena: numeroSeguro(crudo.capturasSirena),
    capturasMonstruo: numeroSeguro(crudo.capturasMonstruo),
  };
}

function normalizarJugadorPermanente(crudo: unknown): JugadorPermanente | null {
  if (!esObjeto(crudo)) return null;
  if (typeof crudo.id !== 'string' || !crudo.id || typeof crudo.nombre !== 'string') return null;
  const nombre = crudo.nombre.trim();
  if (!nombre) return null;
  const evolucion: EntradaEvolucion[] = Array.isArray(crudo.evolucion)
    ? crudo.evolucion
        .filter(esObjeto)
        .filter((e) => typeof e.fecha === 'string')
        .map((e) => ({
          fecha: e.fecha as string,
          puntos: numeroSeguro(e.puntos),
          posicion: numeroSeguro(e.posicion, 1),
        }))
        .slice(-MAX_PARTIDAS_EVOLUCION)
    : [];
  return {
    id: crudo.id,
    nombre: nombre.slice(0, 40),
    estadisticas: normalizarEstadisticas(crudo.estadisticas),
    evolucion,
  };
}

function normalizarRonda(crudo: unknown): EntradaHistorialRonda | null {
  if (!esObjeto(crudo)) return null;
  if (typeof crudo.ronda !== 'number' && typeof crudo.ronda !== 'string') return null;
  if (typeof crudo.acumuladoNuevo !== 'number' || !Number.isFinite(crudo.acumuladoNuevo)) return null;
  const detalles = (valor: unknown) =>
    Array.isArray(valor)
      ? valor.filter(esObjeto).map((b) => ({
          etiqueta: typeof b.etiqueta === 'string' ? b.etiqueta : '',
          cantidad: numeroSeguro(b.cantidad),
          unitario: typeof b.unitario === 'number' ? b.unitario : ('-' as const),
          subtotal: numeroSeguro(b.subtotal),
        }))
      : [];
  return {
    ronda: crudo.ronda,
    apuesta: typeof crudo.apuesta === 'number' ? crudo.apuesta : '-',
    ganadas: typeof crudo.ganadas === 'number' ? crudo.ganadas : '-',
    acierto: crudo.acierto === true,
    puntajeBase: numeroSeguro(crudo.puntajeBase),
    totalBonos: numeroSeguro(crudo.totalBonos),
    bonosCobradas: detalles(crudo.bonosCobradas),
    bonosNoCobradas: detalles(crudo.bonosNoCobradas),
    totalRonda: numeroSeguro(crudo.totalRonda),
    acumuladoAnterior: numeroSeguro(crudo.acumuladoAnterior),
    acumuladoNuevo: crudo.acumuladoNuevo,
  };
}

function normalizarRanking(crudo: unknown): RankingJugador | null {
  if (!esObjeto(crudo) || typeof crudo.nombre !== 'string') return null;
  if (typeof crudo.puntos !== 'number' || !Number.isFinite(crudo.puntos)) return null;
  const historial = Array.isArray(crudo.historial)
    ? crudo.historial.map(normalizarRonda).filter((r): r is EntradaHistorialRonda => r !== null)
    : [];
  return {
    ...(typeof crudo.permanenteId === 'string' ? { permanenteId: crudo.permanenteId } : {}),
    nombre: crudo.nombre.slice(0, 40),
    puntos: crudo.puntos,
    historial,
  };
}

function normalizarPartidaHistorial(crudo: unknown): EntradaHistorialPartida | null {
  if (!esObjeto(crudo) || typeof crudo.fecha !== 'string' || !Array.isArray(crudo.ranking)) return null;
  const ranking = crudo.ranking.map(normalizarRanking).filter((r): r is RankingJugador => r !== null);
  if (ranking.length === 0) return null;
  return { fecha: crudo.fecha, ranking };
}

/** Valida el contenido de un archivo .json de copia de seguridad. */
export function interpretarCopiaSeguridad(texto: string): ResultadoInterpretacion {
  if (texto.length > TAMANO_MAXIMO_COPIA_BYTES) {
    return { ok: false, motivo: 'El archivo es demasiado grande para ser una copia de seguridad.' };
  }
  let crudo: unknown;
  try {
    crudo = JSON.parse(texto);
  } catch {
    return { ok: false, motivo: 'El archivo no es un JSON válido.' };
  }
  if (!esObjeto(crudo) || crudo.app !== APP_COPIA_SEGURIDAD) {
    return { ok: false, motivo: 'Ese archivo no es una copia de seguridad de Skull King.' };
  }
  if (typeof crudo.version === 'number' && crudo.version > VERSION_COPIA_SEGURIDAD) {
    return {
      ok: false,
      motivo: 'La copia fue creada con una versión más nueva de la app. Actualizá y volvé a intentar.',
    };
  }
  if (!Array.isArray(crudo.jugadores) || !Array.isArray(crudo.historial)) {
    return { ok: false, motivo: 'Faltan datos de jugadores o de historial en el archivo.' };
  }

  const jugadores = crudo.jugadores
    .map(normalizarJugadorPermanente)
    .filter((j): j is JugadorPermanente => j !== null);
  const historial = crudo.historial
    .map(normalizarPartidaHistorial)
    .filter((p): p is EntradaHistorialPartida => p !== null);
  const descartados =
    crudo.jugadores.length - jugadores.length + (crudo.historial.length - historial.length);

  return {
    ok: true,
    descartados,
    copia: {
      app: APP_COPIA_SEGURIDAD,
      version: VERSION_COPIA_SEGURIDAD,
      exportada: typeof crudo.exportada === 'string' ? crudo.exportada : new Date().toISOString(),
      jugadores,
      historial,
    },
  };
}

function firmaPartida(partida: EntradaHistorialPartida): string {
  return `${partida.fecha}|${partida.ranking.map((r) => `${r.nombre}:${r.puntos}`).join(',')}`;
}

export interface ResultadoCombinacion {
  jugadores: JugadorPermanente[];
  historial: EntradaHistorialPartida[];
  jugadoresNuevos: number;
  jugadoresActualizados: number;
  partidasNuevas: number;
  partidasRepetidas: number;
}

/**
 * Suma la copia a los datos actuales sin perder nada:
 * - jugadores con el mismo id: se conserva el que tiene más partidas jugadas;
 * - partidas del historial: se omiten las que ya existen (misma fecha y resultado).
 */
export function combinarCopiaSeguridad(
  jugadoresActuales: JugadorPermanente[],
  historialActual: EntradaHistorialPartida[],
  copia: CopiaSeguridad
): ResultadoCombinacion {
  const porId = new Map(jugadoresActuales.map((j) => [j.id, j]));
  let jugadoresNuevos = 0;
  let jugadoresActualizados = 0;
  for (const entrante of copia.jugadores) {
    const existente = porId.get(entrante.id);
    if (!existente) {
      porId.set(entrante.id, entrante);
      jugadoresNuevos += 1;
    } else if (entrante.estadisticas.partidasJugadas > existente.estadisticas.partidasJugadas) {
      porId.set(entrante.id, entrante);
      jugadoresActualizados += 1;
    }
  }

  const firmas = new Set(historialActual.map(firmaPartida));
  const nuevas: EntradaHistorialPartida[] = [];
  let partidasRepetidas = 0;
  for (const partida of copia.historial) {
    const firma = firmaPartida(partida);
    if (firmas.has(firma)) {
      partidasRepetidas += 1;
      continue;
    }
    firmas.add(firma);
    nuevas.push(partida);
  }

  return {
    jugadores: [...porId.values()],
    historial: [...historialActual, ...nuevas],
    jugadoresNuevos,
    jugadoresActualizados,
    partidasNuevas: nuevas.length,
    partidasRepetidas,
  };
}
