import { useMemo, useState } from 'react';
import { MAX_JUGADORES_BASE, MAX_JUGADORES_EXPANSION } from '../../../constantes';
import { useApp } from '../../../estado/AppProvider';
import { Modal } from '../../../ui/Modal';
import { AVATARES } from '../../../datos/avatares';
import { AvatarPirata } from '../../../ui/AvatarPirata';
import { SelectorAvatar } from '../../../ui/SelectorAvatar';
import { ModalAviso } from '../../../ui/ModalAviso';
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
  const [avatarNuevo, setAvatarNuevo] = useState(AVATARES[0]!);
  const [eligiendoAvatar, setEligiendoAvatar] = useState(false);

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
    const nuevo = crearJugadorPermanente(nombreNuevo, avatarNuevo);
    if (!nuevo) return;
    setEligiendoAvatar(false);
    setAvatarNuevo(AVATARES[(AVATARES.indexOf(avatarNuevo) + 1) % AVATARES.length]!);
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
            <h3 className="text-xl font-black text-amber-300">Seleccionar jugadores</h3>
            <span className="text-sm font-bold uppercase tracking-wider text-slate-400">
              {idsJugadoresSeleccionados.length} de {maximoJugadores} seleccionados
            </span>
          </div>
          <button
            type="button"
            onClick={cerrar}
            aria-label="Cerrar selector de jugadores"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-2xl font-bold text-slate-400 hover:bg-slate-700 hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-3 border-b border-slate-800 bg-slate-900/60 p-4">
          <input
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            type="search"
            placeholder="Buscar pirata..."
            aria-label="Buscar pirata por nombre"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-3 text-lg text-white focus:border-amber-500 focus:outline-none"
          />

          <form
            className="flex flex-col gap-2"
            onSubmit={(evento) => {
              evento.preventDefault();
              crearJugador();
            }}
          >
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEligiendoAvatar(!eligiendoAvatar)}
                aria-label="Elegir icono del nuevo pirata"
                className="btn-marron-oscuro flex shrink-0 items-center justify-center rounded-xl px-2"
              >
                <AvatarPirata emoji={avatarNuevo} tamano="md" />
              </button>
              <input
                value={nombreNuevo}
                onChange={(evento) => setNombreNuevo(evento.target.value)}
                type="text"
                placeholder="Nombre del nuevo pirata..."
                className="min-w-0 flex-1 !text-lg"
              />
              <button type="submit" className="btn-blanco-marron shrink-0 rounded-xl px-4 text-lg font-bold">
                + Crear
              </button>
            </div>
            {eligiendoAvatar && (
              <SelectorAvatar
                valor={avatarNuevo}
                onCambiar={(emoji) => {
                  setAvatarNuevo(emoji);
                  setEligiendoAvatar(false);
                }}
              />
            )}
          </form>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto p-4 scroll-oculto">
          {jugadoresFiltrados.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              <span className="text-sm font-bold uppercase tracking-widest text-slate-400">
                Tocá en el orden en que juegan
              </span>
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
            <div className="tarjeta-marron p-6 text-center text-base text-slate-300">
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
            className="btn-blanco-marron w-full rounded-2xl py-3.5 text-lg font-bold"
          >
            Listo ({idsJugadoresSeleccionados.length})
          </button>
        </div>
      </Modal>

      <ModalAviso
        abierto={mostrarLimite}
        titulo="Límite alcanzado"
        mensaje={`Este modo permite seleccionar un máximo de ${maximoJugadores} jugadores.`}
        textoBoton="OK"
        onCerrar={() => setMostrarLimite(false)}
      />
    </>
  );
}
