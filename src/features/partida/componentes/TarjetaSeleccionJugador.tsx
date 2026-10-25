import { avatarDe } from '../../../datos/avatares';
import { AvatarPirata } from '../../../ui/AvatarPirata';
import type { JugadorPermanente } from '../../../tipos';

interface Props {
  jugador: JugadorPermanente;
  posicionSeleccion: number | null;
  onSeleccionar: () => void;
}

/** Tarjeta de selección: ícono, nombre y solo dos datos (partidas jugadas y victorias). */
export function TarjetaSeleccionJugador({ jugador, posicionSeleccion, onSeleccionar }: Props) {
  const seleccionado = posicionSeleccion !== null;
  const { partidasJugadas, victorias } = jugador.estadisticas;

  return (
    <button
      type="button"
      onClick={onSeleccionar}
      aria-pressed={seleccionado}
      className={`flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left ${
        seleccionado ? 'btn-blanco-marron' : 'btn-marron-oscuro'
      }`}
    >
      <AvatarPirata emoji={avatarDe(jugador.id, jugador.avatar)} tamano="lg" activo={seleccionado} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {seleccionado && <span className="badge-orden-jugador !h-7 !w-7 shrink-0 !text-base">{posicionSeleccion}</span>}
          <span className={`truncate text-2xl font-black ${seleccionado ? 'text-amber-950' : 'text-white'}`}>
            {jugador.nombre}
          </span>
        </div>
        <span className={`mt-1 block text-base font-bold ${seleccionado ? 'text-amber-900' : 'text-slate-300'}`}>
          {partidasJugadas} {partidasJugadas === 1 ? 'partida' : 'partidas'} · 🏆 {victorias}{' '}
          {victorias === 1 ? 'victoria' : 'victorias'}
        </span>
      </div>
    </button>
  );
}
