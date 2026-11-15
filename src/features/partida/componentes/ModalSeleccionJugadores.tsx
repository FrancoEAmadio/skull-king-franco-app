import { useMemo, useState } from 'react';
import { MAX_JUGADORES_BASE, MAX_JUGADORES_EXPANSION } from '../../../constantes';
import { useApp } from '../../../estado/AppProvider';
import { EncabezadoModal, Modal } from '../../../ui/Modal';
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
      borrarSeleccionJugadores,
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
        <EncabezadoModal
          titulo="Seleccionar jugadores"
          subtitulo={`${idsJugadoresSeleccionados.length} de ${maximoJugadores} seleccionados`}
          onCerrar={cerrar}
        />

        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 p-4">
          <input
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            type="search"
            placeholder="Buscar pirata..."
            aria-label="Buscar pirata por nombre"
            className="campo"
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
                className="btn-claro shrink-0 px-2"
              >
                <AvatarPirata emoji={avatarNuevo} tamano="md" />
              </button>
              <input
                value={nombreNuevo}
                onChange={(evento) => setNombreNuevo(evento.target.value)}
                type="text"
                placeholder="Nombre del nuevo pirata..."
                className="campo min-w-0 flex-1"
              />
              <button type="submit" className="btn-primario shrink-0 px-4 text-sm">
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

        <div className="scroll-oculto flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto p-4">
          {jugadoresFiltrados.length > 0 ? (
            <>
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Tocá en el orden en que juegan</span>
              {jugadoresFiltrados.map((jugador) => (
                <TarjetaSeleccionJugador
                  key={jugador.id}
                  jugador={jugador}
                  posicionSeleccion={posicionSeleccion(jugador.id)}
                  onSeleccionar={() => seleccionarJugador(jugador.id)}
                />
              ))}
            </>
          ) : (
            <div className="p-6 text-center text-sm text-slate-500">
              {jugadoresPermanentes.length === 0 ? 'Todavía no hay piratas. Creá el primero arriba.' : 'No hay piratas que coincidan con la búsqueda.'}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-200 p-4">
          {idsJugadoresSeleccionados.length > 0 && (
            <button type="button" onClick={borrarSeleccionJugadores} className="btn-peligro mx-auto px-5 py-2.5 text-sm">
              Borrar selección
            </button>
          )}
          <button type="button" onClick={cerrar} className="btn-dorado w-full py-3.5 text-base">
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
