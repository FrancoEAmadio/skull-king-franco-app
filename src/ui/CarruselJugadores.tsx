import { useEffect, useRef } from 'react';
import { AvatarPirata } from './AvatarPirata';
import { avatarDe } from '../datos/avatares';

export interface ItemCarrusel {
  indice: number;
  id: string;
  nombre: string;
  avatar?: string;
  /** Línea chica debajo del nombre, por ejemplo "1 / 2". */
  detalle?: string;
}

interface Props {
  items: ItemCarrusel[];
  seleccionado: number;
  onSeleccionar: (indice: number) => void;
}

/** Barra fija de jugadores: el seleccionado queda siempre en el centro, con el anterior y el siguiente a los lados. */
export function CarruselJugadores({ items, seleccionado, onSeleccionar }: Props) {
  const contenedor = useRef<HTMLDivElement>(null);
  const refs = useRef(new Map<number, HTMLButtonElement>());

  useEffect(() => {
    const caja = contenedor.current;
    const item = refs.current.get(seleccionado);
    if (!caja || !item) return;
    const izquierda = item.offsetLeft - (caja.clientWidth - item.clientWidth) / 2;
    caja.scrollTo({ left: Math.max(0, izquierda), behavior: 'smooth' });
  }, [seleccionado, items.length]);

  return (
    <nav
      ref={contenedor}
      aria-label="Jugadores"
      className="carrusel-jugadores sticky top-0 z-20 -mx-4 border-b border-amber-500/20 bg-slate-950/90 backdrop-blur"
    >
      {items.map((item) => {
        const activo = item.indice === seleccionado;
        return (
          <button
            key={item.id + item.indice}
            ref={(el) => {
              if (el) refs.current.set(item.indice, el);
              else refs.current.delete(item.indice);
            }}
            type="button"
            aria-current={activo}
            onClick={() => onSeleccionar(item.indice)}
            className={`carrusel-item ${activo ? 'carrusel-item-activo' : ''}`}
          >
            <AvatarPirata emoji={avatarDe(item.id, item.avatar)} tamano={activo ? 'lg' : 'md'} activo={activo} />
            <span className={`max-w-full truncate font-black ${activo ? 'text-lg text-white' : 'text-base text-slate-300'}`}>
              {item.nombre}
            </span>
            {item.detalle && (
              <span className={`text-sm font-bold ${activo ? 'text-amber-300' : 'text-slate-400'}`}>{item.detalle}</span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
