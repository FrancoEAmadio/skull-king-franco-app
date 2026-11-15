import { useState } from 'react';
import { useApp } from '../../../estado/AppProvider';
import { MIN_JUGADORES } from '../../../constantes';
import { AvatarPirata } from '../../../ui/AvatarPirata';
import { avatarDe } from '../../../datos/avatares';
import { ModalSeleccionJugadores } from './ModalSeleccionJugadores';

export function SelectorJugadores() {
  const {
    jugadoresPermanentes,
    partida: { idsJugadoresSeleccionados, alternarSeleccionJugador },
  } = useApp();
  const [selectorAbierto, setSelectorAbierto] = useState(false);
  const faltan = idsJugadoresSeleccionados.length < MIN_JUGADORES;
  const elegidos = idsJugadoresSeleccionados
    .map((id) => jugadoresPermanentes.find((j) => j.id === id))
    .filter((j): j is NonNullable<typeof j> => Boolean(j));

  return (
    <section className="tarjeta flex flex-col gap-3 p-4">
      <h3 className="tarjeta-titulo">3. Jugadores ({elegidos.length})</h3>
      {elegidos.length > 0 && (
        <ul className="flex flex-col gap-2">
          {elegidos.map((j, idx) => (
            <li key={j.id} className="opcion flex items-center gap-3 p-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-oro text-xs font-bold text-tinta-oro">
                {idx + 1}
              </span>
              <AvatarPirata emoji={avatarDe(j.id, j.avatar)} tamano="sm" />
              <span className="min-w-0 flex-1 truncate text-base font-semibold text-tinta">{j.nombre}</span>
              <button
                type="button"
                onClick={() => alternarSeleccionJugador(j.id)}
                aria-label={`Quitar a ${j.nombre}`}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-600 text-base font-bold text-white"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={() => setSelectorAbierto(true)}
        className={`btn-claro w-full px-4 py-3.5 text-sm font-bold ${faltan ? 'latir' : ''}`}
      >
        {elegidos.length > 0 ? 'Cambiar selección' : 'Seleccionar jugadores'}
      </button>
      <ModalSeleccionJugadores abierto={selectorAbierto} onCerrar={() => setSelectorAbierto(false)} />
    </section>
  );
}
