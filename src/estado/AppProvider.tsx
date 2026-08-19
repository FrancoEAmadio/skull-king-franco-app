import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { JugadorPermanente, PantallaId } from '../tipos';
import { useJugadoresPermanentes } from '../features/jugadores/useJugadoresPermanentes';
import { usePartidaState } from '../features/partida/usePartidaState';
import type { PartidaState } from '../features/partida/usePartidaState';

interface ContextoApp {
  pantallaActual: PantallaId;
  setPantallaActual: (pantalla: PantallaId) => void;

  jugadoresPermanentes: JugadorPermanente[];
  crearJugadorPermanente: (nombre: string) => JugadorPermanente | null;
  renombrarJugadorPermanente: (id: string, nuevoNombre: string) => void;
  eliminarJugadorPermanente: (id: string) => void;

  partida: PartidaState;

  mostrarPodio: boolean;
  abrirPodio: () => void;
  cerrarPodio: () => void;

  menuHamburguesaAbierto: boolean;
  setMenuHamburguesaAbierto: (abierto: boolean) => void;

  jugadorViendoHistorial: { nombre: string; historial: unknown[] } | null;
  verHistorialJugador: (jugador: { nombre: string; historial: unknown[] }) => void;
  cerrarHistorialJugador: () => void;

  jugadorPermanenteViendoStats: JugadorPermanente | null;
  verEstadisticasJugador: (jugador: JugadorPermanente) => void;
  cerrarEstadisticasJugador: () => void;
}

const AppContext = createContext<ContextoApp | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [pantallaActual, setPantallaActual] = useState<PantallaId>('inicio');
  const [mostrarPodio, setMostrarPodio] = useState(false);
  const [menuHamburguesaAbierto, setMenuHamburguesaAbierto] = useState(false);
  const [jugadorViendoHistorial, setJugadorViendoHistorial] = useState<{
    nombre: string;
    historial: unknown[];
  } | null>(null);
  const [jugadorPermanenteViendoStats, setJugadorPermanenteViendoStats] =
    useState<JugadorPermanente | null>(null);

  const {
    jugadores: jugadoresPermanentes,
    crear,
    renombrar,
    eliminar,
    reemplazarLista,
  } = useJugadoresPermanentes();

  const partida = usePartidaState({
    pantallaActual,
    setPantallaActual,
    jugadoresPermanentes,
    actualizarJugadoresPermanentes: reemplazarLista,
  });

  const eliminarJugadorPermanente = useCallback(
    (id: string) => {
      if (!confirm('¿Eliminar esta tarjeta de jugador y todas sus estadísticas guardadas?')) return;
      eliminar(id);
    },
    [eliminar]
  );

  const cerrarPodio = useCallback(() => {
    setMostrarPodio(false);
    if (partida.partidaFinalizada) setPantallaActual('inicio');
  }, [partida.partidaFinalizada]);

  const abrirPodio = useCallback(() => setMostrarPodio(true), []);

  const valor: ContextoApp = {
    pantallaActual,
    setPantallaActual,
    jugadoresPermanentes,
    crearJugadorPermanente: crear,
    renombrarJugadorPermanente: renombrar,
    eliminarJugadorPermanente,
    partida,
    mostrarPodio,
    abrirPodio,
    cerrarPodio,
    menuHamburguesaAbierto,
    setMenuHamburguesaAbierto,
    jugadorViendoHistorial,
    verHistorialJugador: setJugadorViendoHistorial,
    cerrarHistorialJugador: () => setJugadorViendoHistorial(null),
    jugadorPermanenteViendoStats,
    verEstadisticasJugador: setJugadorPermanenteViendoStats,
    cerrarEstadisticasJugador: () => setJugadorPermanenteViendoStats(null),
  };

  return <AppContext.Provider value={valor}>{children}</AppContext.Provider>;
}

export function useApp(): ContextoApp {
  const contexto = useContext(AppContext);
  if (!contexto) throw new Error('useApp debe usarse dentro de <AppProvider>');
  return contexto;
}
