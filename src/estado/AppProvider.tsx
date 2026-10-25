import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { JugadorPermanente, PantallaId } from '../tipos';
import { useJugadoresPermanentes } from '../features/jugadores/useJugadoresPermanentes';
import { usePartidaState } from '../features/partida/usePartidaState';
import type { PartidaState } from '../features/partida/usePartidaState';
import { cargarAjustes, guardarAjustes } from '../infra/ajustes';
import type { Ajustes } from '../infra/ajustes';
import { configurarVibracion } from '../infra/vibracion';

interface ContextoApp {
  pantallaActual: PantallaId;
  setPantallaActual: (pantalla: PantallaId) => void;

  jugadoresPermanentes: JugadorPermanente[];
  crearJugadorPermanente: (nombre: string, avatar?: string) => JugadorPermanente | null;
  cambiarAvatarJugadorPermanente: (id: string, avatar: string) => void;
  renombrarJugadorPermanente: (id: string, nuevoNombre: string) => void;
  eliminarJugadorPermanente: (id: string) => void;
  reemplazarJugadoresPermanentes: (lista: JugadorPermanente[]) => void;

  partida: PartidaState;

  mostrarPodio: boolean;
  abrirPodio: () => void;
  cerrarPodio: () => void;

  menuHamburguesaAbierto: boolean;
  setMenuHamburguesaAbierto: (abierto: boolean) => void;

  ajustesAbiertos: boolean;
  setAjustesAbiertos: (abierto: boolean) => void;
  ajustes: Ajustes;
  cambiarAjustes: (cambios: Partial<Ajustes>) => void;

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
  const [ajustesAbiertos, setAjustesAbiertos] = useState(false);
  const [ajustes, setAjustes] = useState<Ajustes>(cargarAjustes);
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
    cambiarAvatar,
    eliminar,
    reemplazarLista,
  } = useJugadoresPermanentes();

  const partida = usePartidaState({
    pantallaActual,
    setPantallaActual,
    jugadoresPermanentes,
    actualizarJugadoresPermanentes: reemplazarLista,
  });

  useEffect(() => {
    configurarVibracion(ajustes.vibracion);
  }, [ajustes.vibracion]);

  const cambiarAjustes = useCallback((cambios: Partial<Ajustes>) => {
    setAjustes((previos) => {
      const nuevos = { ...previos, ...cambios };
      guardarAjustes(nuevos);
      return nuevos;
    });
  }, []);

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
    cambiarAvatarJugadorPermanente: cambiarAvatar,
    eliminarJugadorPermanente: eliminar,
    reemplazarJugadoresPermanentes: reemplazarLista,
    partida,
    mostrarPodio,
    abrirPodio,
    cerrarPodio,
    menuHamburguesaAbierto,
    setMenuHamburguesaAbierto,
    ajustesAbiertos,
    setAjustesAbiertos,
    ajustes,
    cambiarAjustes,
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
