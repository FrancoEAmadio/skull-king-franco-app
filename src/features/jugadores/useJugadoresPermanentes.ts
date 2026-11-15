import { useCallback, useEffect, useState } from 'react';
import {
  cargarJugadoresPermanentes,
  guardarJugadoresPermanentes,
} from '../../infra/almacenamiento';
import type { JugadorPermanente } from '../../tipos';
import { crearJugadorPermanente } from '../../dominio/estadisticas';
import { completarColores, coloresParaNuevo } from '../../datos/coloresJugador';

export function useJugadoresPermanentes() {
  const [jugadores, setJugadores] = useState<JugadorPermanente[]>([]);

  useEffect(() => {
    const cargados = cargarJugadoresPermanentes();
    const { lista, cambio } = completarColores(cargados);
    setJugadores(lista);
    if (cambio) guardarJugadoresPermanentes(lista);
  }, []);

  const persistir = useCallback((nuevos: JugadorPermanente[]) => {
    setJugadores(nuevos);
    guardarJugadoresPermanentes(nuevos);
  }, []);

  const crear = useCallback(
    (nombre: string, avatar?: string, colores?: { colorTarjeta: string; colorAvatar: string }): JugadorPermanente | null => {
      const nombreLimpio = nombre.trim();
      if (!nombreLimpio) return null;
      const nuevo = { ...crearJugadorPermanente(nombreLimpio, avatar), ...(colores ?? coloresParaNuevo(jugadores)) };
      persistir([...jugadores, nuevo]);
      return nuevo;
    },
    [jugadores, persistir]
  );

  const renombrar = useCallback(
    (id: string, nuevoNombre: string) => {
      const nombreLimpio = nuevoNombre.trim();
      if (!nombreLimpio) return;
      persistir(
        jugadores.map((jug) => (jug.id === id ? { ...jug, nombre: nombreLimpio } : jug))
      );
    },
    [jugadores, persistir]
  );

  const cambiarAvatar = useCallback(
    (id: string, avatar: string) => {
      persistir(jugadores.map((jug) => (jug.id === id ? { ...jug, avatar } : jug)));
    },
    [jugadores, persistir]
  );

  const cambiarColores = useCallback(
    (id: string, colores: { colorTarjeta?: string; colorAvatar?: string }) => {
      persistir(jugadores.map((jug) => (jug.id === id ? { ...jug, ...colores } : jug)));
    },
    [jugadores, persistir]
  );

  const eliminar = useCallback(
    (id: string) => {
      persistir(jugadores.filter((jug) => jug.id !== id));
    },
    [jugadores, persistir]
  );

  const reemplazarLista = useCallback(
    (lista: JugadorPermanente[]) => {
      persistir(lista);
    },
    [persistir]
  );

  return { jugadores, crear, renombrar, cambiarAvatar, cambiarColores, eliminar, reemplazarLista };
}
