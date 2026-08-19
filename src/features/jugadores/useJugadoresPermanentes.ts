import { useCallback, useEffect, useState } from 'react';
import {
  cargarJugadoresPermanentes,
  guardarJugadoresPermanentes,
} from '../../infra/almacenamiento';
import type { JugadorPermanente } from '../../tipos';
import { crearJugadorPermanente } from '../../dominio/estadisticas';

export function useJugadoresPermanentes() {
  const [jugadores, setJugadores] = useState<JugadorPermanente[]>([]);

  useEffect(() => {
    setJugadores(cargarJugadoresPermanentes());
  }, []);

  const persistir = useCallback((nuevos: JugadorPermanente[]) => {
    setJugadores(nuevos);
    guardarJugadoresPermanentes(nuevos);
  }, []);

  const crear = useCallback(
    (nombre: string): JugadorPermanente | null => {
      const nombreLimpio = nombre.trim();
      if (!nombreLimpio) return null;
      const nuevo = crearJugadorPermanente(nombreLimpio);
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

  return { jugadores, crear, renombrar, eliminar, reemplazarLista };
}
