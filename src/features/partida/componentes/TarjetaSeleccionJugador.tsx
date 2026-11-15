import { avatarDe } from '../../../datos/avatares';
import { AvatarPirata } from '../../../ui/AvatarPirata';
import { colorAvatarDe, colorTarjetaDe } from '../../../datos/coloresJugador';
import { TONOS_APP } from '../../../ui/tonos';
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
  const tonoTarjeta = colorTarjetaDe(jugador.id, jugador.colorTarjeta);
  const tonoAvatar = colorAvatarDe(jugador.id, jugador.colorAvatar, jugador.colorTarjeta);
  const colores = TONOS_APP[tonoTarjeta];

  return (
    <button
      type="button"
      onClick={onSeleccionar}
      aria-pressed={seleccionado}
      className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition ${seleccionado ? colores.activo : colores.reposo}`}
    >
      <AvatarPirata emoji={avatarDe(jugador.id, jugador.avatar)} fondo={tonoAvatar} tamano="md" activo={seleccionado} />
      <div className="min-w-0 flex-1">
        <span className="block truncate text-lg font-bold text-tinta">{jugador.nombre}</span>
        <span className="mt-0.5 block text-xs font-semibold text-slate-500">
          {partidasJugadas} {partidasJugadas === 1 ? 'partida' : 'partidas'} · 🏆 {victorias} {victorias === 1 ? 'victoria' : 'victorias'}
        </span>
      </div>
      {seleccionado && (
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colores.punto} text-sm font-bold text-white`}
          aria-label={`Puesto ${posicionSeleccion}`}
        >
          {posicionSeleccion}
        </span>
      )}
    </button>
  );
}
