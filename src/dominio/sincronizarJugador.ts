import type {
  AlianzaBotin,
  EntradaHistorialPartida,
  EntradaHistorialRonda,
  Jugador,
  PartidaGuardada,
  RegistroHabilidad,
  ResumenRondaJugador,
} from '../tipos';

/** Datos de una tarjeta de jugador que se copian dentro de las partidas. */
export interface CambiosJugador {
  nombre?: string;
  avatar?: string;
}

export interface ReferenciaJugador {
  id: string;
  nombreViejo: string;
  cambios: CambiosJugador;
}

type PartidaSincronizable = Pick<
  PartidaGuardada,
  'jugadores' | 'alianzasBotinRonda' | 'registroHabilidadesRonda' | 'resumenRondaActual' | 'backupRondaActual' | 'ultimaRondaEditable'
>;

const mismoId = (a: string | undefined, b: string) => a === b;

function jugadoresActualizados(jugadores: Jugador[], ref: ReferenciaJugador): Jugador[] {
  return jugadores.map((j) =>
    mismoId(j.permanenteId, ref.id)
      ? { ...j, ...(ref.cambios.nombre ? { nombre: ref.cambios.nombre } : {}), ...(ref.cambios.avatar ? { avatar: ref.cambios.avatar } : {}) }
      : j
  );
}

function alianzasActualizadas(alianzas: AlianzaBotin[], jugadores: Jugador[], ref: ReferenciaJugador): AlianzaBotin[] {
  const nombre = ref.cambios.nombre;
  if (!nombre) return alianzas;
  return alianzas.map((a) => ({
    ...a,
    nombreA: mismoId(jugadores[a.idxA]?.permanenteId, ref.id) ? nombre : a.nombreA,
    nombreB: mismoId(jugadores[a.idxB]?.permanenteId, ref.id) ? nombre : a.nombreB,
  }));
}

function registrosActualizados(registros: RegistroHabilidad[], jugadores: Jugador[], ref: ReferenciaJugador): RegistroHabilidad[] {
  const nombre = ref.cambios.nombre;
  if (!nombre) return registros;
  return registros.map((r) => (mismoId(jugadores[r.jugadorIdx]?.permanenteId, ref.id) ? { ...r, jugadorNombre: nombre } : r));
}

function resumenActualizado(resumen: ResumenRondaJugador[], jugadores: Jugador[], ref: ReferenciaJugador): ResumenRondaJugador[] {
  const nombre = ref.cambios.nombre;
  if (!nombre) return resumen;
  return resumen.map((fila, idx) => (mismoId(jugadores[idx]?.permanenteId, ref.id) ? { ...fila, nombre } : fila));
}

/** Actualiza una partida (en curso o pausada) con el nuevo nombre/icono de una tarjeta de jugador. */
export function sincronizarPartida<T extends PartidaSincronizable>(partida: T, ref: ReferenciaJugador): T {
  const jugadores = jugadoresActualizados(partida.jugadores, ref);
  const backup = partida.backupRondaActual;
  const editable = partida.ultimaRondaEditable;
  return {
    ...partida,
    jugadores,
    alianzasBotinRonda: alianzasActualizadas(partida.alianzasBotinRonda, partida.jugadores, ref),
    registroHabilidadesRonda: registrosActualizados(partida.registroHabilidadesRonda, partida.jugadores, ref),
    resumenRondaActual: resumenActualizado(partida.resumenRondaActual, partida.jugadores, ref),
    backupRondaActual: backup
      ? {
          ...backup,
          jugadoresCompletos: jugadoresActualizados(backup.jugadoresCompletos, ref),
          alianzasBotinRonda: alianzasActualizadas(backup.alianzasBotinRonda, backup.jugadoresCompletos, ref),
          registroHabilidadesRonda: registrosActualizados(backup.registroHabilidadesRonda, backup.jugadoresCompletos, ref),
          resumenRondaActual: resumenActualizado(backup.resumenRondaActual, backup.jugadoresCompletos, ref),
        }
      : backup,
    ultimaRondaEditable: editable
      ? {
          ...editable,
          jugadores: jugadoresActualizados(editable.jugadores, ref),
          alianzasBotinRonda: alianzasActualizadas(editable.alianzasBotinRonda, editable.jugadores, ref),
          registroHabilidadesRonda: registrosActualizados(editable.registroHabilidadesRonda, editable.jugadores, ref),
        }
      : editable,
  };
}

const igualNombre = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** Actualiza el nombre del jugador en las partidas ya terminadas (las viejas, sin id, se vinculan por nombre). */
export function sincronizarHistorial(historial: EntradaHistorialPartida[], ref: ReferenciaJugador): EntradaHistorialPartida[] {
  const nombre = ref.cambios.nombre;
  if (!nombre) return historial;
  return historial.map((partida) => ({
    ...partida,
    ranking: partida.ranking.map((fila) => {
      const esElMismo = fila.permanenteId ? fila.permanenteId === ref.id : igualNombre(fila.nombre, ref.nombreViejo);
      if (!esElMismo) return fila;
      const historialRondas: EntradaHistorialRonda[] = fila.historial.map((ronda) =>
        ronda.habilidadesRegistradas
          ? {
              ...ronda,
              habilidadesRegistradas: ronda.habilidadesRegistradas.map((h) =>
                igualNombre(h.jugadorNombre, ref.nombreViejo) ? { ...h, jugadorNombre: nombre } : h
              ),
            }
          : ronda
      );
      return { ...fila, nombre, permanenteId: ref.id, historial: historialRondas };
    }),
  }));
}
