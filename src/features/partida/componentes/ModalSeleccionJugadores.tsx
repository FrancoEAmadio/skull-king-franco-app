import { useMemo, useState } from 'react';
import { MAX_JUGADORES_BASE, MAX_JUGADORES_EXPANSION } from '../../../constantes';
import { useApp } from '../../../estado/AppProvider';
import { Modal } from '../../../ui/Modal';
import { TarjetaSeleccionJugador } from './TarjetaSeleccionJugador';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
}

function normalizarBusqueda(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('es')
    .trim();
}

export function ModalSeleccionJugadores({ abierto, onCerrar }: Props) {
  const {
    jugadoresPermanentes,
    crearJugadorPermanente,
    partida: {
      alternarSeleccionJugador,
      configuracionMesa,
      idsJugadoresSeleccionados,
      posicionSeleccion,
    },
  } = useApp();
  const [busqueda, setBusqueda] = useState('');
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [mostrarLimite, setMostrarLimite] = useState(false);

  const jugadoresFiltrados = useMemo(() => {
    const patron = normalizarBusqueda(busqueda);
    if (!patron) return jugadoresPermanentes;
    return jugadoresPermanentes.filter((jugador) =>
      normalizarBusqueda(jugador.nombre).includes(patron)
    );
  }, [busqueda, jugadoresPermanentes]);

  const maximoJugadores = configuracionMesa.modoContenido === 'expansion'
    ? MAX_JUGADORES_EXPANSION
    : MAX_JUGADORES_BASE;

  const cerrar = () => {
    setBusqueda('');
    onCerrar();
  };

  const crearJugador = () => {
    const nuevo = crearJugadorPermanente(nombreNuevo);
    if (!nuevo) return;
    setNombreNuevo('');
    setBusqueda('');
  };

  const seleccionarJugador = (id: string) => {
    const resultado = alternarSeleccionJugador(id);
    if (resultado === 'limite_alcanzado') setMostrarLimite(true);
  };

  return (
    <>
      <Modal abierto={abierto} onCerrar={cerrar} ancho="max-w-md" cerrarAlHacerClickAfuera>
        <div className="flex items-center justify-between border-b border-amber-900/60 bg-slate-900 p-4">
          <div>
            <h3 className="text-lg font-black text-amber-300">Seleccionar jugadores</h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {idsJugadoresSeleccionados.length} de {maximoJugadores} seleccionados
            </span>
          </div>
          <button
            type="button"
            onClick={cerrar}
            aria-label="Cerrar selector de jugadores"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-xl font-bold text-slate-400 hover:bg-slate-700 hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4 scroll-oculto">
          <input
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            type="search"
            placeholder="Buscar pirata..."
            aria-label="Buscar pirata por nombre"
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
          />

          <form
            className="flex gap-2"
            onSubmit={(evento) => {
              evento.preventDefault();
              crearJugador();
            }}
          >
            <input
              value={nombreNuevo}
              onChange={(evento) => setNombreNuevo(evento.target.value)}
              type="text"
              placeholder="Nombre del nuevo pirata..."
              className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
            />
            <button type="submit" className="btn-blanco-marron rounded-xl px-4 py-2.5 text-sm font-bold">
              + Crear
            </button>
          </form>

          {jugadoresFiltrados.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {jugadoresFiltrados.map((jugador) => (
                <TarjetaSeleccionJugador
                  key={jugador.id}
                  jugador={jugador}
                  posicionSeleccion={posicionSeleccion(jugador.id)}
                  onSeleccionar={() => seleccionarJugador(jugador.id)}
                />
              ))}
            </div>
          ) : (
            <div className="tarjeta-marron p-6 text-center text-sm text-slate-300">
              {jugadoresPermanentes.length === 0
                ? 'Todavía no hay piratas. Creá el primero arriba.'
                : 'No hay piratas que coincidan con la búsqueda.'}
            </div>
          )}
        </div>

        <div className="border-t border-amber-900/60 p-4">
          <button
            type="button"
            onClick={cerrar}
            className="btn-blanco-marron w-full rounded-2xl py-3.5 text-base font-bold"
          >
            Listo ({idsJugadoresSeleccionados.length})
          </button>
        </div>
      </Modal>

      <Modal
        abierto={mostrarLimite}
        onCerrar={() => setMostrarLimite(false)}
        ancho="max-w-xs"
        zIndex="z-[70]"
      >
        <div className="flex flex-col gap-4 p-5 text-center">
          <div>
            <h3 className="text-xl font-black text-amber-300">Límite alcanzado</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Este modo permite seleccionar un máximo de {maximoJugadores} jugadores.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMostrarLimite(false)}
            className="btn-blanco-marron w-full rounded-xl py-3 text-sm font-black"
          >
            OK
          </button>
        </div>
      </Modal>
    </>
  );
}
