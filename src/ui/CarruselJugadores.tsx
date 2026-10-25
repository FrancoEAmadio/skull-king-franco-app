import { AvatarPirata } from './AvatarPirata';
import { avatarDe } from '../datos/avatares';

export interface ItemCarrusel {
  indice: number;
  id: string;
  nombre: string;
  avatar?: string;
  /** Línea chica debajo del nombre, por ejemplo "1/2". */
  detalle?: string;
}

interface Props {
  items: ItemCarrusel[];
  seleccionado: number;
  onSeleccionar: (indice: number) => void;
  /** "pestañas": solo nombres, pensado para ir pegado arriba de una tarjeta (sin íconos). */
  variante?: 'pestanas' | 'tarjetas';
}

const VISIBLES = 3;

/**
 * Siempre muestra 3 jugadores: el anterior, el actual y el siguiente.
 * En el primero queda a la izquierda y en el último a la derecha.
 */
export function CarruselJugadores({ items, seleccionado, onSeleccionar, variante = 'tarjetas' }: Props) {
  const posicion = Math.max(
    0,
    items.findIndex((item) => item.indice === seleccionado)
  );
  const inicio = Math.min(Math.max(0, posicion - 1), Math.max(0, items.length - VISIBLES));
  const visibles = items.slice(inicio, inicio + VISIBLES);
  const pestanas = variante === 'pestanas';

  return (
    <nav
      aria-label="Jugadores"
      className={
        pestanas
          ? 'sticky top-0 z-20 border-b border-slate-700 bg-[#111827] p-2'
          : 'sticky top-0 z-20 -mx-4 px-4 py-2 backdrop-blur-md'
      }
    >
      <div className="grid grid-cols-3 gap-2">
        {visibles.map((item) => {
          const activo = item.indice === seleccionado;
          return (
            <button
              key={item.id + item.indice}
              type="button"
              aria-current={activo}
              onClick={() => onSeleccionar(item.indice)}
              className={`flex min-h-16 min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 ${
                activo ? 'opcion-activa' : 'opcion-inactiva'
              }`}
            >
              {!pestanas && (
                <AvatarPirata emoji={avatarDe(item.id, item.avatar)} tamano={activo ? 'lg' : 'md'} activo={activo} />
              )}
              <span
                className={`w-full truncate px-1 text-center font-black ${
                  activo ? 'text-xl text-white' : 'text-lg text-slate-300'
                }`}
              >
                {item.nombre}
              </span>
              {item.detalle && (
                <span className={`text-base font-bold ${activo ? 'text-amber-300' : 'text-slate-400'}`}>
                  {item.detalle}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
