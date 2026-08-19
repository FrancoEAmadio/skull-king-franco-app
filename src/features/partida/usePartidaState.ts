import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  AlianzaBotin,
  BackupRondaActual,
  BackupRondaJugador,
  ConfiguracionMesa,
  EntradaHistorialPartida,
  Jugador,
  JugadorPermanente,
  PantallaId,
  PartidaGuardada,
  PasoPartida,
  RegistroHabilidad,
  ResumenRondaJugador,
} from '../../tipos';
import {
  MAX_ALIANZAS_POR_RONDA,
  MAX_HABILIDADES_POR_RONDA,
} from '../../constantes';
import {
  borrarHistorial,
  borrarPartidaGuardada,
  cargarHistorial,
  cargarPartidaGuardada,
  guardarHistorial,
  guardarPartida,
} from '../../infra/almacenamiento';
import { obtenerCartasPorRondaDelModo } from '../../datos/modosReparto';
import {
  aplicarBonoFinalDeBlancas,
  cerrarRonda,
} from '../../dominio/cierreRonda';
import { calcularBonoCartasBlancas, calcularPuntajeRonda } from '../../dominio/puntuacion';
import { calcularBonosAlianzasBotin } from '../../dominio/alianzas';
import { calcularMaximoDisponible } from '../../dominio/bonos';
import { aplicarFinDePartida } from '../../dominio/estadisticas';
import {
  calcularCartasPorJugadorEnRonda,
  calcularIndiceJugadorInicial,
  calcularJugadoresOrdenados,
  calcularLimiteComodines,
  calcularMaxGanadasPara,
} from './selectores';

interface Argumentos {
  pantallaActual: PantallaId;
  setPantallaActual: (pantalla: PantallaId) => void;
  jugadoresPermanentes: JugadorPermanente[];
  actualizarJugadoresPermanentes: (nuevos: JugadorPermanente[]) => void;
}

function generarIdHabilidad(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function crearJugadorDePartida(permanente: JugadorPermanente): Jugador {
  return {
    permanenteId: permanente.id,
    nombre: permanente.nombre,
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

function snapshotJugador(jugador: Jugador): BackupRondaJugador {
  return {
    apuesta: jugador.apuesta,
    ganadas: jugador.ganadas,
    modoEnvite: jugador.modoEnvite,
    bribonHabilidadPts: jugador.bribonHabilidadPts,
    bribonStolenFrom: jugador.bribonStolenFrom,
    eventosBono: { ...jugador.eventosBono },
  };
}

function aplicarBackupJugador(jugador: Jugador, backup: BackupRondaJugador): Jugador {
  return {
    ...jugador,
    apuesta: backup.apuesta,
    ganadas: backup.ganadas,
    modoEnvite: backup.modoEnvite,
    bribonHabilidadPts: backup.bribonHabilidadPts,
    bribonStolenFrom: backup.bribonStolenFrom,
    eventosBono: { ...backup.eventosBono },
  };
}

const CONFIG_INICIAL: ConfiguracionMesa = {
  modoContenido: 'expansion',
  usarComodinesBonificacion: false,
  usarHabilidadesPiratas: true,
  usarModoBribon: false,
  cobrarBonosSinAcierto: false,
  modoReparto: 'clasico',
  cartasPorRonda: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  reglasOpcionales: {
    kraken: true,
    ballenaBlanca: true,
    botin: true,
    primerOficialKong: true,
    pirataMaryThorne: true,
    mono15: true,
    mantarrayaMoteada: true,
    davyJones: true,
    caminarPorLaTabla: true,
    ultimaDescarga: true,
    carta7: true,
    carta8: true,
    cartas0y14: true,
  },
};

export function usePartidaState({
  pantallaActual,
  setPantallaActual,
  jugadoresPermanentes,
  actualizarJugadoresPermanentes,
}: Argumentos) {
  const [configuracionMesa, setConfiguracionMesa] = useState<ConfiguracionMesa>(CONFIG_INICIAL);
  const [idsJugadoresSeleccionados, setIdsJugadoresSeleccionados] = useState<string[]>([]);

  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [rondaActual, setRondaActual] = useState(1);
  const [pasoPartida, setPasoPartida] = useState<PasoPartida>('apuestas');
  const [cartasPorRondaActivas, setCartasPorRondaActivas] = useState<number[]>([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  ]);
  const [jugadorSeleccionadoIdx, setJugadorSeleccionadoIdx] = useState(0);
  const [alianzasBotinRonda, setAlianzasBotinRonda] = useState<AlianzaBotin[]>([]);
  const [registroHabilidadesRonda, setRegistroHabilidadesRonda] = useState<RegistroHabilidad[]>([]);
  const [resumenRondaActual, setResumenRondaActual] = useState<ResumenRondaJugador[]>([]);

  const [hayPartidaGuardada, setHayPartidaGuardada] = useState(false);
  const [partidaFinalizada, setPartidaFinalizada] = useState(false);
  const [editandoRondaAnterior, setEditandoRondaAnterior] = useState(false);
  const [backupRondaActual, setBackupRondaActual] = useState<BackupRondaActual | null>(null);

  const [historialPartidas, setHistorialPartidas] = useState<EntradaHistorialPartida[]>([]);

  useEffect(() => {
    setHistorialPartidas(cargarHistorial());
    const partida = cargarPartidaGuardada();
    if (!partida) return;

    setHayPartidaGuardada(true);
    setJugadores(partida.jugadores);
    setRondaActual(partida.rondaActual);
    setConfiguracionMesa((previa) => ({
      ...previa,
      ...partida.configuracionMesa,
      reglasOpcionales: {
        ...previa.reglasOpcionales,
        ...partida.configuracionMesa.reglasOpcionales,
      },
    }));
    setAlianzasBotinRonda(partida.alianzasBotinRonda);
    setJugadorSeleccionadoIdx(partida.jugadorSeleccionadoIdx);
    setRegistroHabilidadesRonda(partida.registroHabilidadesRonda);
    setCartasPorRondaActivas(
      partida.cartasPorRondaActivas.length > 0
        ? partida.cartasPorRondaActivas
        : obtenerCartasPorRondaDelModo(
            partida.configuracionMesa.modoReparto,
            partida.configuracionMesa.cartasPorRonda
          )
    );
    setPasoPartida(partida.pasoPartida);
    setResumenRondaActual(partida.resumenRondaActual);
    setEditandoRondaAnterior(partida.editandoRondaAnterior);
    setBackupRondaActual(partida.backupRondaActual);
  }, []);

  const totalRondas = cartasPorRondaActivas.length || 10;

  const indiceJugadorInicial = useMemo(
    () => calcularIndiceJugadorInicial(rondaActual, jugadores.length),
    [rondaActual, jugadores.length]
  );

  const jugadoresOrdenados = useMemo(
    () => calcularJugadoresOrdenados(jugadores, indiceJugadorInicial),
    [jugadores, indiceJugadorInicial]
  );

  const indiceVisualActual = useMemo(
    () =>
      Math.max(
        0,
        jugadoresOrdenados.findIndex((item) => item.originalIndex === jugadorSeleccionadoIdx)
      ),
    [jugadoresOrdenados, jugadorSeleccionadoIdx]
  );

  const jugadorActual = jugadores[jugadorSeleccionadoIdx] ?? null;

  const cartasPorJugadorEnRonda = useMemo(
    () => calcularCartasPorJugadorEnRonda(cartasPorRondaActivas, rondaActual),
    [cartasPorRondaActivas, rondaActual]
  );

  const tablaGeneralOrdenada = useMemo(
    () => [...jugadores].sort((a, b) => b.puntos - a.puntos),
    [jugadores]
  );

  const totalGanadasAsignadas = jugadores.reduce(
    (acc, jugador) => acc + (Number(jugador.ganadas) || 0),
    0
  );

  const puedeModificarRondaAnterior = rondaActual > 1 && !editandoRondaAnterior && !partidaFinalizada;

  const limiteComodines = useMemo(
    () => calcularLimiteComodines(jugadores, jugadorSeleccionadoIdx, configuracionMesa),
    [jugadores, jugadorSeleccionadoIdx, configuracionMesa]
  );

  const puntajeProyectadoActual = useMemo(() => {
    if (!jugadorActual) return 0;
    const resultado = calcularPuntajeRonda({
      apuesta: jugadorActual.apuesta,
      ganadas: jugadorActual.ganadas,
      numeroRonda: cartasPorJugadorEnRonda,
      eventosBono: jugadorActual.eventosBono,
      usarModoBribon: configuracionMesa.usarModoBribon,
      modoEnvite: jugadorActual.modoEnvite,
      bribonHabilidadPts: jugadorActual.bribonHabilidadPts,
      cobrarBonosSinAcierto: configuracionMesa.cobrarBonosSinAcierto,
    });
    const bonosBotin = calcularBonosAlianzasBotin(alianzasBotinRonda, jugadores);
    return resultado.puntajeTotal + (bonosBotin[jugadorSeleccionadoIdx] ?? 0);
  }, [
    jugadorActual,
    cartasPorJugadorEnRonda,
    configuracionMesa,
    alianzasBotinRonda,
    jugadores,
    jugadorSeleccionadoIdx,
  ]);

  const textoBotonAvanzar = useMemo(() => {
    if (indiceVisualActual < jugadoresOrdenados.length - 1) return 'Siguiente Jugador ➔';
    if (editandoRondaAnterior) return '✓ Guardar Corrección de Ronda ➔';
    if (rondaActual < totalRondas) return 'Ver Resumen de la Ronda ➔';
    return '🏁 Ver Resumen Final ➔';
  }, [indiceVisualActual, jugadoresOrdenados.length, editandoRondaAnterior, rondaActual, totalRondas]);

  const persistirPartida = useCallback(
    (parcial: Partial<PartidaGuardada> = {}) => {
      const partida: PartidaGuardada = {
        jugadores,
        rondaActual,
        configuracionMesa,
        alianzasBotinRonda,
        jugadorSeleccionadoIdx,
        registroHabilidadesRonda,
        cartasPorRondaActivas,
        pasoPartida,
        resumenRondaActual,
        editandoRondaAnterior,
        backupRondaActual,
        ...parcial,
      };
      guardarPartida(partida);
      setHayPartidaGuardada(true);
    },
    [
      jugadores,
      rondaActual,
      configuracionMesa,
      alianzasBotinRonda,
      jugadorSeleccionadoIdx,
      registroHabilidadesRonda,
      cartasPorRondaActivas,
      pasoPartida,
      resumenRondaActual,
      editandoRondaAnterior,
      backupRondaActual,
    ]
  );

  // Autoguardado (equivalente al watch deep de Vue)
  useEffect(() => {
    if (pantallaActual !== 'partida' || partidaFinalizada) return;
    persistirPartida();
  }, [pantallaActual, partidaFinalizada, persistirPartida]);

  const actualizarJugador = useCallback(
    (indice: number, cambios: Partial<Jugador>) => {
      setJugadores((previos) =>
        previos.map((jugador, idx) => (idx === indice ? { ...jugador, ...cambios } : jugador))
      );
    },
    []
  );

  const irANuevaPartida = useCallback(() => {
    setIdsJugadoresSeleccionados([]);
    setPantallaActual('nueva_partida');
  }, [setPantallaActual]);

  const comenzarPartida = useCallback(() => {
    if (idsJugadoresSeleccionados.length < 2) {
      alert('Seleccioná al menos 2 piratas para empezar la partida.');
      return;
    }
    const cartas = obtenerCartasPorRondaDelModo(
      configuracionMesa.modoReparto,
      configuracionMesa.cartasPorRonda
    );

    const nuevosJugadores = idsJugadoresSeleccionados
      .map((id) => jugadoresPermanentes.find((jug) => jug.id === id))
      .filter((jug): jug is JugadorPermanente => Boolean(jug))
      .map(crearJugadorDePartida);

    setCartasPorRondaActivas(cartas);
    setJugadores(nuevosJugadores);
    setRondaActual(1);
    setJugadorSeleccionadoIdx(0);
    setPasoPartida('apuestas');
    setAlianzasBotinRonda([]);
    setRegistroHabilidadesRonda([]);
    setResumenRondaActual([]);
    setPartidaFinalizada(false);
    setEditandoRondaAnterior(false);
    setBackupRondaActual(null);
    setPantallaActual('partida');
  }, [
    idsJugadoresSeleccionados,
    configuracionMesa,
    jugadoresPermanentes,
    setPantallaActual,
  ]);

  const cambiarApuesta = useCallback(
    (indice: number, delta: number) => {
      setJugadores((previos) =>
        previos.map((jugador, idx) => {
          if (idx !== indice) return jugador;
          const nuevo = Math.max(0, Math.min(cartasPorJugadorEnRonda, jugador.apuesta + delta));
          return { ...jugador, apuesta: nuevo };
        })
      );
    },
    [cartasPorJugadorEnRonda]
  );

  const cambiarModoEnvite = useCallback((indice: number, modo: Jugador['modoEnvite']) => {
    setJugadores((previos) =>
      previos.map((jugador, idx) => (idx === indice ? { ...jugador, modoEnvite: modo } : jugador))
    );
  }, []);

  const maxGanadasPara = useCallback(
    (indice: number) => calcularMaxGanadasPara(indice, jugadores, cartasPorJugadorEnRonda),
    [jugadores, cartasPorJugadorEnRonda]
  );

  const cambiarGanadas = useCallback(
    (indice: number, delta: number) => {
      const max = maxGanadasPara(indice);
      setJugadores((previos) =>
        previos.map((jugador, idx) => {
          if (idx !== indice) return jugador;
          const nuevo = Math.max(0, Math.min(max, jugador.ganadas + delta));
          return { ...jugador, ganadas: nuevo };
        })
      );
    },
    [maxGanadasPara]
  );

  const limpiarBazasRonda = useCallback(() => {
    setJugadores((previos) => previos.map((jugador) => ({ ...jugador, ganadas: 0 })));
  }, []);

  const avanzarAPasoBazas = useCallback(() => setPasoPartida('bazas'), []);
  const volverAPasoApuestas = useCallback(() => setPasoPartida('apuestas'), []);
  const volverAPasoBazas = useCallback(() => setPasoPartida('bazas'), []);

  const avanzarAPasoBonos = useCallback(() => {
    if (totalGanadasAsignadas > cartasPorJugadorEnRonda) {
      alert(
        `Las bazas asignadas (${totalGanadasAsignadas}) superan el máximo posible de esta ronda (${cartasPorJugadorEnRonda}).`
      );
      return;
    }
    setJugadorSeleccionadoIdx(indiceJugadorInicial);
    setPasoPartida('bonos');
  }, [totalGanadasAsignadas, cartasPorJugadorEnRonda, indiceJugadorInicial]);

  const cambiarCartasBlancas = useCallback((indice: number, delta: number) => {
    setJugadores((previos) =>
      previos.map((jugador, idx) => {
        if (idx !== indice) return jugador;
        const nuevo = Math.max(0, (jugador.cartasBlancas || 0) + delta);
        return { ...jugador, cartasBlancas: nuevo };
      })
    );
  }, []);

  const cambiarCantidadBono = useCallback(
    (idEvento: string, delta: number) => {
      if (!jugadorActual) return;
      const actual = Number(jugadorActual.eventosBono[idEvento]) || 0;
      const maximo = calcularMaximoDisponible(idEvento, {
        jugadorSeleccionadoIdx,
        jugadores,
        configuracion: configuracionMesa,
        cartasPorJugadorEnRonda,
      });
      const nuevo = Math.max(0, Math.min(maximo, actual + delta));
      actualizarJugador(jugadorSeleccionadoIdx, {
        eventosBono: { ...jugadorActual.eventosBono, [idEvento]: nuevo },
      });
    },
    [
      jugadorActual,
      jugadorSeleccionadoIdx,
      jugadores,
      configuracionMesa,
      cartasPorJugadorEnRonda,
      actualizarJugador,
    ]
  );

  const obtenerCantidadBono = useCallback(
    (idEvento: string) => Number(jugadorActual?.eventosBono[idEvento]) || 0,
    [jugadorActual]
  );

  const obtenerMaximoBono = useCallback(
    (idEvento: string) =>
      calcularMaximoDisponible(idEvento, {
        jugadorSeleccionadoIdx,
        jugadores,
        configuracion: configuracionMesa,
        cartasPorJugadorEnRonda,
      }),
    [jugadorSeleccionadoIdx, jugadores, configuracionMesa, cartasPorJugadorEnRonda]
  );

  const borrarBonoInmediato = useCallback(
    (idEvento: string) => {
      if (!jugadorActual) return;
      actualizarJugador(jugadorSeleccionadoIdx, {
        eventosBono: { ...jugadorActual.eventosBono, [idEvento]: 0 },
      });
    },
    [jugadorActual, jugadorSeleccionadoIdx, actualizarJugador]
  );

  const limpiarTodosLosEventos = useCallback(() => {
    if (!jugadorActual) return;
    actualizarJugador(jugadorSeleccionadoIdx, { eventosBono: {} });
  }, [jugadorActual, jugadorSeleccionadoIdx, actualizarJugador]);

  const agregarAlianzaBotin = useCallback(
    (idxA: number, idxB: number) => {
      if (idxA === idxB) {
        alert('Una alianza de Botín debe realizarse entre dos jugadores diferentes.');
        return;
      }
      const jugadorA = jugadores[idxA];
      const jugadorB = jugadores[idxB];
      if (!jugadorA || !jugadorB) return;
      if (alianzasBotinRonda.length >= MAX_ALIANZAS_POR_RONDA) {
        alert('Ya se registraron las 2 alianzas de Botín máximas de esta ronda.');
        return;
      }
      setAlianzasBotinRonda((previas) => [
        ...previas,
        { idxA, idxB, nombreA: jugadorA.nombre, nombreB: jugadorB.nombre },
      ]);
    },
    [jugadores, alianzasBotinRonda.length]
  );

  const eliminarAlianzaBotin = useCallback((indice: number) => {
    setAlianzasBotinRonda((previas) => previas.filter((_, idx) => idx !== indice));
  }, []);

  const esHabilidadYaRegistrada = useCallback(
    (tipo: string) => registroHabilidadesRonda.some((h) => h.tipo === tipo),
    [registroHabilidadesRonda]
  );

  const esKongYaRegistradoCon = useCallback(
    (subTipo: string) =>
      registroHabilidadesRonda.some(
        (h) => h.tipo === 'Primer Oficial Kong' && h.etiqueta.includes(subTipo)
      ),
    [registroHabilidadesRonda]
  );

  const habilidadesBloqueadasPorLimite = registroHabilidadesRonda.length >= MAX_HABILIDADES_POR_RONDA;

  const registrarHabilidad = useCallback(
    (
      tipo: string,
      indiceJugador: number,
      extra: { etiqueta: string; detalle: string }
    ): boolean => {
      const jugador = jugadores[indiceJugador];
      if (!jugador) return false;
      setRegistroHabilidadesRonda((previas) => [
        ...previas,
        {
          id: generarIdHabilidad(),
          ronda: rondaActual,
          jugadorIdx: indiceJugador,
          jugadorNombre: jugador.nombre,
          tipo,
          etiqueta: extra.etiqueta,
          detalle: extra.detalle,
        },
      ]);
      return true;
    },
    [jugadores, rondaActual]
  );

  const aplicarBribonRotan = useCallback(
    (indiceJugador: number, pts: number) => {
      if (esHabilidadYaRegistrada('Bribón de Roatán')) return;
      const ok = registrarHabilidad('Bribón de Roatán', indiceJugador, {
        etiqueta: 'Bribón de Roatán (Apuesta de puntos)',
        detalle: `Arriesgó una apuesta de ${pts} pts sobre el cumplimiento de su envite`,
      });
      if (!ok) return;
      actualizarJugador(indiceJugador, { bribonHabilidadPts: pts, bribonStolenFrom: null });
    },
    [esHabilidadYaRegistrada, registrarHabilidad, actualizarJugador]
  );

  const aplicarHarryGigante = useCallback(
    (indiceJugador: number, delta: number) => {
      if (esHabilidadYaRegistrada('Harry el Gigante')) return;
      const jugador = jugadores[indiceJugador];
      if (!jugador) return;
      const nuevoEnvite = Math.max(
        0,
        Math.min(cartasPorJugadorEnRonda, (jugador.apuesta || 0) + delta)
      );
      const ok = registrarHabilidad('Harry el Gigante', indiceJugador, {
        etiqueta: 'Harry el Gigante (Modificó Envite)',
        detalle: `Modificó su envite de ${jugador.apuesta} a ${nuevoEnvite} baza(s) (${delta > 0 ? '+1' : '-1'})`,
      });
      if (!ok) return;
      actualizarJugador(indiceJugador, { apuesta: nuevoEnvite });
    },
    [
      esHabilidadYaRegistrada,
      jugadores,
      cartasPorJugadorEnRonda,
      registrarHabilidad,
      actualizarJugador,
    ]
  );

  const aplicarKongCopiaBribon = useCallback(
    (indiceJugador: number, pts: number) => {
      if (esKongYaRegistradoCon('Bribón')) return;
      const ok = registrarHabilidad('Primer Oficial Kong', indiceJugador, {
        etiqueta: 'Primer Oficial Kong (Copió Bribón de Roatán)',
        detalle: `Copió apuesta de ${pts} pts (ambos conservan su apuesta de riesgo)`,
      });
      if (!ok) return;
      actualizarJugador(indiceJugador, {
        bribonHabilidadPts: pts,
        bribonStolenFrom: '(Copiado por Kong)',
      });
    },
    [esKongYaRegistradoCon, registrarHabilidad, actualizarJugador]
  );

  const aplicarKongHarryGigante = useCallback(
    (indiceJugador: number, delta: number) => {
      if (esKongYaRegistradoCon('Harry')) return;
      const jugador = jugadores[indiceJugador];
      if (!jugador) return;
      const nuevoEnvite = Math.max(
        0,
        Math.min(cartasPorJugadorEnRonda, (jugador.apuesta || 0) + delta)
      );
      const ok = registrarHabilidad('Primer Oficial Kong', indiceJugador, {
        etiqueta: 'Primer Oficial Kong (Copió Harry el Gigante)',
        detalle: `Modificó su envite de ${jugador.apuesta} a ${nuevoEnvite} baza(s) (${delta > 0 ? '+1' : '-1'}) copiando a Harry`,
      });
      if (!ok) return;
      actualizarJugador(indiceJugador, { apuesta: nuevoEnvite });
    },
    [
      esKongYaRegistradoCon,
      jugadores,
      cartasPorJugadorEnRonda,
      registrarHabilidad,
      actualizarJugador,
    ]
  );

  const eliminarRegistroHabilidad = useCallback(
    (indice: number) => {
      const item = registroHabilidadesRonda[indice];
      if (!item) return;
      const esBribon =
        item.tipo === 'Bribón de Roatán' ||
        (item.tipo === 'Primer Oficial Kong' && item.etiqueta.includes('Bribón'));
      if (esBribon) {
        actualizarJugador(item.jugadorIdx, { bribonHabilidadPts: null, bribonStolenFrom: null });
      }
      setRegistroHabilidadesRonda((previas) => previas.filter((_, idx) => idx !== indice));
    },
    [registroHabilidadesRonda, actualizarJugador]
  );

  const cerrarPartida = useCallback(
    (jugadoresFinales: Jugador[], resumen: ResumenRondaJugador[]) => {
      const conBlancas = configuracionMesa.usarComodinesBonificacion
        ? aplicarBonoFinalDeBlancas(jugadoresFinales, resumen, calcularBonoCartasBlancas)
        : { jugadores: jugadoresFinales, resumen };

      const rankingFinal = [...conBlancas.jugadores].sort((a, b) => b.puntos - a.puntos);
      const fecha = new Date().toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const nuevaEntrada: EntradaHistorialPartida = {
        fecha,
        ranking: rankingFinal.map((jug) => ({
          nombre: jug.nombre,
          puntos: jug.puntos,
          historial: jug.historial,
        })),
      };
      const nuevoHistorial = [nuevaEntrada, ...historialPartidas];
      setHistorialPartidas(nuevoHistorial);
      guardarHistorial(nuevoHistorial);

      const permanentesActualizados = jugadoresPermanentes.map((permanente) => {
        const indice = rankingFinal.findIndex((j) => j.permanenteId === permanente.id);
        if (indice === -1) return permanente;
        const jugadorFinal = rankingFinal[indice]!;
        return aplicarFinDePartida(permanente, {
          fecha,
          puntos: jugadorFinal.puntos,
          posicion: indice + 1,
          apuestasAcertadas: jugadorFinal.apuestasAcertadas,
          apuestasFalladas: jugadorFinal.apuestasFalladas,
          capturasSkullKing: jugadorFinal.capturasSkullKing,
          capturasSirena: jugadorFinal.capturasSirena,
          capturasMonstruo: jugadorFinal.capturasMonstruo,
        });
      });
      actualizarJugadoresPermanentes(permanentesActualizados);

      setJugadores(conBlancas.jugadores);
      setResumenRondaActual(conBlancas.resumen);
      borrarPartidaGuardada();
      setHayPartidaGuardada(false);
      setPartidaFinalizada(true);
      setPasoPartida('resumen');
    },
    [configuracionMesa, historialPartidas, jugadoresPermanentes, actualizarJugadoresPermanentes]
  );

  const guardarJugadorYContinuar = useCallback(() => {
    if (indiceVisualActual < jugadoresOrdenados.length - 1) {
      const siguiente = jugadoresOrdenados[indiceVisualActual + 1]!;
      setJugadorSeleccionadoIdx(siguiente.originalIndex);
      return;
    }

    // Fin de ronda: cierre y recálculo
    const { jugadores: jugadoresCerrados, resumen } = cerrarRonda(
      {
        jugadores,
        configuracion: configuracionMesa,
        alianzas: alianzasBotinRonda,
        habilidades: registroHabilidadesRonda,
        ronda: rondaActual,
        cartasPorJugadorEnRonda,
      },
      editandoRondaAnterior
    );

    setJugadores(jugadoresCerrados);
    setResumenRondaActual(resumen);
    setAlianzasBotinRonda([]);
    setRegistroHabilidadesRonda([]);

    if (editandoRondaAnterior && backupRondaActual) {
      const conBackup = jugadoresCerrados.map((jugador, idx) => {
        const backup = backupRondaActual.jugadoresEstado[idx];
        return backup ? aplicarBackupJugador(jugador, backup) : jugador;
      });
      setJugadores(conBackup);
      setRondaActual(backupRondaActual.ronda);
      setEditandoRondaAnterior(false);
      setBackupRondaActual(null);
      setPasoPartida('resumen');
      return;
    }

    if (rondaActual < totalRondas) {
      setRondaActual(rondaActual + 1);
      setJugadorSeleccionadoIdx(calcularIndiceJugadorInicial(rondaActual + 1, jugadoresCerrados.length));
      setPasoPartida('resumen');
      return;
    }

    cerrarPartida(jugadoresCerrados, resumen);
  }, [
    indiceVisualActual,
    jugadoresOrdenados,
    jugadores,
    configuracionMesa,
    alianzasBotinRonda,
    registroHabilidadesRonda,
    rondaActual,
    cartasPorJugadorEnRonda,
    editandoRondaAnterior,
    backupRondaActual,
    totalRondas,
    cerrarPartida,
  ]);

  const irASiguienteRonda = useCallback(() => setPasoPartida('apuestas'), []);

  const iniciarModificacionRondaAnterior = useCallback(() => {
    if (!puedeModificarRondaAnterior) return;

    const backup: BackupRondaActual = {
      ronda: rondaActual,
      pasoPartida,
      jugadorSeleccionadoIdx,
      jugadoresEstado: jugadores.map(snapshotJugador),
    };

    const rondaAnterior = rondaActual - 1;
    const jugadoresRestaurados = jugadores.map((jugador) => {
      const entrada = jugador.historial.find((h) => h.ronda === rondaAnterior);
      if (!entrada) return jugador;
      return {
        ...jugador,
        apuesta: entrada.apuesta !== '-' ? Number(entrada.apuesta) || 0 : 0,
        ganadas: entrada.ganadas !== '-' ? Number(entrada.ganadas) || 0 : 0,
        eventosBono: {},
      };
    });

    setBackupRondaActual(backup);
    setJugadores(jugadoresRestaurados);
    setRondaActual(rondaAnterior);
    setEditandoRondaAnterior(true);
    setPasoPartida('apuestas');
    setJugadorSeleccionadoIdx(calcularIndiceJugadorInicial(rondaAnterior, jugadoresRestaurados.length));
  }, [
    puedeModificarRondaAnterior,
    rondaActual,
    pasoPartida,
    jugadorSeleccionadoIdx,
    jugadores,
  ]);

  const cancelarModificacionRondaAnterior = useCallback(() => {
    if (!editandoRondaAnterior || !backupRondaActual) return;
    setRondaActual(backupRondaActual.ronda);
    setPasoPartida(backupRondaActual.pasoPartida);
    setJugadorSeleccionadoIdx(backupRondaActual.jugadorSeleccionadoIdx);
    setJugadores((previos) =>
      previos.map((jugador, idx) => {
        const backup = backupRondaActual.jugadoresEstado[idx];
        return backup ? aplicarBackupJugador(jugador, backup) : jugador;
      })
    );
    setEditandoRondaAnterior(false);
    setBackupRondaActual(null);
  }, [editandoRondaAnterior, backupRondaActual]);

  const descartarPartidaActual = useCallback(() => {
    if (!confirm('¿Estás seguro de que querés descartar y eliminar la partida actual?')) return;
    borrarPartidaGuardada();
    setHayPartidaGuardada(false);
    setPantallaActual('inicio');
  }, [setPantallaActual]);

  const eliminarPartidaHistorial = useCallback(
    (indice: number) => {
      const nuevo = historialPartidas.filter((_, idx) => idx !== indice);
      setHistorialPartidas(nuevo);
      guardarHistorial(nuevo);
    },
    [historialPartidas]
  );

  const borrarTodoElHistorial = useCallback(() => {
    if (!confirm('¿Estás seguro de que querés borrar todo el historial de partidas?')) return;
    setHistorialPartidas([]);
    borrarHistorial();
  }, []);

  const alternarSeleccionJugador = useCallback(
    (id: string) => {
      const yaSeleccionado = idsJugadoresSeleccionados.includes(id);
      if (yaSeleccionado) {
        setIdsJugadoresSeleccionados(idsJugadoresSeleccionados.filter((i) => i !== id));
        return;
      }
      const maximo = configuracionMesa.modoContenido === 'expansion' ? 9 : 8;
      if (idsJugadoresSeleccionados.length >= maximo) {
        alert(`La mesa admite un máximo de ${maximo} piratas ${maximo === 8 ? '(9 solo con Expansión)' : ''}.`);
        return;
      }
      setIdsJugadoresSeleccionados([...idsJugadoresSeleccionados, id]);
    },
    [idsJugadoresSeleccionados, configuracionMesa.modoContenido]
  );

  const posicionSeleccion = useCallback(
    (id: string) => {
      const idx = idsJugadoresSeleccionados.indexOf(id);
      return idx === -1 ? null : idx + 1;
    },
    [idsJugadoresSeleccionados]
  );

  return {
    // config
    configuracionMesa,
    setConfiguracionMesa,
    idsJugadoresSeleccionados,
    alternarSeleccionJugador,
    posicionSeleccion,
    // estado de partida
    jugadores,
    rondaActual,
    pasoPartida,
    cartasPorRondaActivas,
    setCartasPorRondaActivas,
    jugadorSeleccionadoIdx,
    setJugadorSeleccionadoIdx,
    alianzasBotinRonda,
    registroHabilidadesRonda,
    resumenRondaActual,
    hayPartidaGuardada,
    partidaFinalizada,
    editandoRondaAnterior,
    historialPartidas,
    // derivados
    totalRondas,
    jugadorActual,
    jugadoresOrdenados,
    indiceVisualActual,
    cartasPorJugadorEnRonda,
    tablaGeneralOrdenada,
    totalGanadasAsignadas,
    puedeModificarRondaAnterior,
    limiteComodines,
    puntajeProyectadoActual,
    textoBotonAvanzar,
    habilidadesBloqueadasPorLimite,
    indiceJugadorInicial,
    // acciones setup
    irANuevaPartida,
    comenzarPartida,
    // acciones partida
    cambiarApuesta,
    cambiarModoEnvite,
    cambiarGanadas,
    maxGanadasPara,
    limpiarBazasRonda,
    avanzarAPasoBazas,
    avanzarAPasoBonos,
    volverAPasoApuestas,
    volverAPasoBazas,
    cambiarCartasBlancas,
    cambiarCantidadBono,
    obtenerCantidadBono,
    obtenerMaximoBono,
    borrarBonoInmediato,
    limpiarTodosLosEventos,
    agregarAlianzaBotin,
    eliminarAlianzaBotin,
    esHabilidadYaRegistrada,
    esKongYaRegistradoCon,
    aplicarBribonRotan,
    aplicarHarryGigante,
    aplicarKongCopiaBribon,
    aplicarKongHarryGigante,
    eliminarRegistroHabilidad,
    guardarJugadorYContinuar,
    irASiguienteRonda,
    iniciarModificacionRondaAnterior,
    cancelarModificacionRondaAnterior,
    descartarPartidaActual,
    eliminarPartidaHistorial,
    borrarTodoElHistorial,
  };
}

export type PartidaState = ReturnType<typeof usePartidaState>;
