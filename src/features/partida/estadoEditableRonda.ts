import type {
  AlianzaBotin,
  BackupRondaActual,
  BackupRondaJugador,
  EstadoRondaEditable,
  Jugador,
  PasoPartida,
  RegistroHabilidad,
  ResumenRondaJugador,
} from '../../tipos';

function clonar<T>(valor: T): T {
  return structuredClone(valor);
}

export function crearBackupJugador(
  jugador: Jugador,
  cartasBlancasPrevias: number
): BackupRondaJugador {
  return {
    apuesta: jugador.apuesta,
    ganadas: jugador.ganadas,
    modoEnvite: jugador.modoEnvite,
    bribonHabilidadPts: jugador.bribonHabilidadPts,
    bribonStolenFrom: jugador.bribonStolenFrom,
    eventosBono: { ...jugador.eventosBono },
    cartasBlancas: jugador.cartasBlancas,
    incrementoCartasBlancas: jugador.cartasBlancas - cartasBlancasPrevias,
  };
}

export function aplicarBackupJugador(jugador: Jugador, backup: BackupRondaJugador): Jugador {
  return {
    ...jugador,
    apuesta: backup.apuesta,
    ganadas: backup.ganadas,
    modoEnvite: backup.modoEnvite,
    bribonHabilidadPts: backup.bribonHabilidadPts,
    bribonStolenFrom: backup.bribonStolenFrom,
    eventosBono: { ...backup.eventosBono },
    cartasBlancas: jugador.cartasBlancas + backup.incrementoCartasBlancas,
  };
}

interface DatosEstadoEditable {
  ronda: number;
  jugadores: Jugador[];
  alianzasBotinRonda: AlianzaBotin[];
  registroHabilidadesRonda: RegistroHabilidad[];
  jugadorSeleccionadoIdx: number;
}

export function crearEstadoRondaEditable(datos: DatosEstadoEditable): EstadoRondaEditable {
  return clonar(datos);
}

interface DatosBackupRonda extends DatosEstadoEditable {
  pasoPartida: PasoPartida;
  resumenRondaActual: ResumenRondaJugador[];
  cartasBlancasPrevias: number[];
}

export function crearBackupRondaActual(datos: DatosBackupRonda): BackupRondaActual {
  return {
    ronda: datos.ronda,
    pasoPartida: datos.pasoPartida,
    jugadorSeleccionadoIdx: datos.jugadorSeleccionadoIdx,
    jugadoresEstado: datos.jugadores.map((jugador, indice) =>
      crearBackupJugador(jugador, datos.cartasBlancasPrevias[indice] ?? jugador.cartasBlancas)
    ),
    jugadoresCompletos: clonar(datos.jugadores),
    alianzasBotinRonda: clonar(datos.alianzasBotinRonda),
    registroHabilidadesRonda: clonar(datos.registroHabilidadesRonda),
    resumenRondaActual: clonar(datos.resumenRondaActual),
  };
}

export function clonarEstadoRondaEditable(estado: EstadoRondaEditable): EstadoRondaEditable {
  return clonar(estado);
}

export function clonarJugadores(jugadores: Jugador[]): Jugador[] {
  return clonar(jugadores);
}

export function aplicarEntradasRonda(
  jugadoresBase: Jugador[],
  entradas: BackupRondaJugador[]
): Jugador[] {
  return jugadoresBase.map((jugador, indice) => {
    const entrada = entradas[indice];
    return entrada ? aplicarBackupJugador(jugador, entrada) : jugador;
  });
}
