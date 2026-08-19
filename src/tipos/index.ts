export type PantallaId = 'inicio' | 'nueva_partida' | 'partida' | 'jugadores' | 'reglas';

export type PasoPartida = 'apuestas' | 'bazas' | 'bonos' | 'resumen';

export type ModoContenido = 'base' | 'avanzado' | 'expansion';

export type ModoEnvite = 'metralla' | 'bala';

export type ModoRepartoId =
  | 'clasico'
  | 'sobre'
  | 'remolino'
  | 'directo_pelea'
  | 'escaramuza'
  | 'andanada'
  | 'tarde'
  | 'personalizado';

export interface ReglasOpcionales {
  kraken: boolean;
  ballenaBlanca: boolean;
  botin: boolean;
  primerOficialKong: boolean;
  pirataMaryThorne: boolean;
  mono15: boolean;
  mantarrayaMoteada: boolean;
  davyJones: boolean;
  caminarPorLaTabla: boolean;
  ultimaDescarga: boolean;
  carta7: boolean;
  carta8: boolean;
  cartas0y14: boolean;
}

export interface ConfiguracionMesa {
  modoContenido: ModoContenido;
  usarComodinesBonificacion: boolean;
  usarHabilidadesPiratas: boolean;
  usarModoBribon: boolean;
  cobrarBonosSinAcierto: boolean;
  modoReparto: ModoRepartoId;
  cartasPorRonda: number[];
  reglasOpcionales: ReglasOpcionales;
}

export interface DetalleBono {
  etiqueta: string;
  cantidad: number;
  unitario: number | '-';
  subtotal: number;
}

export interface RegistroHabilidad {
  id: string;
  ronda: number;
  jugadorIdx: number;
  jugadorNombre: string;
  tipo: string;
  etiqueta: string;
  detalle: string;
}

export interface EntradaHistorialRonda {
  ronda: number | string;
  apuesta: number | '-';
  ganadas: number | '-';
  acierto: boolean;
  puntajeBase: number;
  totalBonos: number;
  bonosCobradas: DetalleBono[];
  bonosNoCobradas: DetalleBono[];
  habilidadesRegistradas?: RegistroHabilidad[];
  totalRonda: number;
  acumuladoAnterior: number;
  acumuladoNuevo: number;
}

export interface ResumenRondaJugador extends EntradaHistorialRonda {
  nombre: string;
}

export interface Jugador {
  permanenteId: string;
  nombre: string;
  puntos: number;
  apuesta: number;
  ganadas: number;
  modoEnvite: ModoEnvite;
  bribonHabilidadPts: number | null;
  bribonStolenFrom: string | null;
  eventosBono: Record<string, number>;
  cartasBlancas: number;
  apuestasAcertadas: number;
  apuestasFalladas: number;
  capturasSkullKing: number;
  capturasSirena: number;
  capturasMonstruo: number;
  historial: EntradaHistorialRonda[];
}

export interface AlianzaBotin {
  idxA: number;
  idxB: number;
  nombreA: string;
  nombreB: string;
}

export interface EventoBono {
  id: string;
  etiqueta: string;
  puntos: number;
  maximo: number;
}

export interface CartaWiki {
  id: string;
  nombre: string;
  modo: 'Juego Base' | 'Reglas Avanzadas' | 'Expansión';
  cantidad: string;
  imagen: string;
  habilidad: string;
  ganaContra: string;
  pierdeContra: string;
  bonificacion: string;
  descripcion: string;
}

export interface ReglaItem {
  titulo: string;
  texto: string;
  abierta: boolean;
}

export interface CategoriaRegla {
  id: string;
  titulo: string;
  categoria: string;
  items: ReglaItem[];
}

export interface ModoReparto {
  id: ModoRepartoId;
  nombre: string;
  icono: string;
  descripcion: string;
  cartas: number[] | null;
}

export interface EstadisticasJugador {
  partidasJugadas: number;
  victorias: number;
  segundoPuesto: number;
  tercerPuesto: number;
  sumaPuntos: number;
  mejorPartida: number | null;
  peorPartida: number | null;
  apuestasAcertadas: number;
  apuestasFalladas: number;
  capturasSkullKing: number;
  capturasSirena: number;
  capturasMonstruo: number;
}

export interface EntradaEvolucion {
  fecha: string;
  puntos: number;
  posicion: number;
}

export interface JugadorPermanente {
  id: string;
  nombre: string;
  estadisticas: EstadisticasJugador;
  evolucion: EntradaEvolucion[];
}

export interface RankingJugador {
  nombre: string;
  puntos: number;
  historial: EntradaHistorialRonda[];
}

export interface EntradaHistorialPartida {
  fecha: string;
  ranking: RankingJugador[];
}

export interface BackupRondaJugador {
  apuesta: number;
  ganadas: number;
  modoEnvite: ModoEnvite;
  bribonHabilidadPts: number | null;
  bribonStolenFrom: string | null;
  eventosBono: Record<string, number>;
  cartasBlancas: number;
  incrementoCartasBlancas: number;
}

export interface EstadoRondaEditable {
  ronda: number;
  jugadores: Jugador[];
  alianzasBotinRonda: AlianzaBotin[];
  registroHabilidadesRonda: RegistroHabilidad[];
  jugadorSeleccionadoIdx: number;
}

export interface BackupRondaActual {
  ronda: number;
  pasoPartida: PasoPartida;
  jugadorSeleccionadoIdx: number;
  jugadoresEstado: BackupRondaJugador[];
  jugadoresCompletos: Jugador[];
  alianzasBotinRonda: AlianzaBotin[];
  registroHabilidadesRonda: RegistroHabilidad[];
  resumenRondaActual: ResumenRondaJugador[];
}

export interface PartidaGuardada {
  jugadores: Jugador[];
  rondaActual: number;
  configuracionMesa: ConfiguracionMesa;
  alianzasBotinRonda: AlianzaBotin[];
  jugadorSeleccionadoIdx: number;
  registroHabilidadesRonda: RegistroHabilidad[];
  cartasPorRondaActivas: number[];
  pasoPartida: PasoPartida;
  resumenRondaActual: ResumenRondaJugador[];
  editandoRondaAnterior: boolean;
  backupRondaActual: BackupRondaActual | null;
  ultimaRondaEditable: EstadoRondaEditable | null;
  partidaPendienteFinalizar: boolean;
}
