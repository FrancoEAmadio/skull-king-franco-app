import {
  CLAVE_LS_HISTORIAL,
  CLAVE_LS_JUGADORES_PERMANENTES,
  CLAVE_LS_PARTIDA_GUARDADA,
} from '../constantes';
import type {
  EntradaHistorialPartida,
  JugadorPermanente,
  PartidaGuardada,
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
  return partida as PartidaGuardada;
}

export function guardarPartida(partida: PartidaGuardada): void {
  escribirJson(CLAVE_LS_PARTIDA_GUARDADA, partida);
}

export function borrarPartidaGuardada(): void {
  localStorage.removeItem(CLAVE_LS_PARTIDA_GUARDADA);
}
