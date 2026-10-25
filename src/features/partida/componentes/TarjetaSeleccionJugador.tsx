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
      <AvatarPirata emoji={avatarDe(jugador.id, jugador.avatar)} tamano="md" activo={seleccionado} />
      <div className="min-w-0 flex-1">
        <span className={`block truncate text-2xl font-black ${seleccionado ? 'text-amber-950' : 'text-white'}`}>
          {jugador.nombre}
        </span>
        <span className={`mt-0.5 block text-[0.95rem] font-bold ${seleccionado ? 'text-amber-900' : 'text-slate-300'}`}>
          {partidasJugadas} {partidasJugadas === 1 ? 'partida' : 'partidas'} · 🏆 {victorias}{' '}
          {victorias === 1 ? 'victoria' : 'victorias'}
        </span>
      </div>
      {seleccionado && (
        <span className="badge-orden-jugador !h-9 !w-9 shrink-0 !text-lg" aria-label={`Puesto ${posicionSeleccion}`}>
          {posicionSeleccion}
        </span>
      )}
    </button>
  );
}
