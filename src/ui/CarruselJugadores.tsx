import { useEffect, useRef } from 'react';

export interface ItemCarrusel {
  indice: number;
  id: string;
  nombre: string;
  /** Línea chica debajo del nombre, por ejemplo "1/2". */
  detalle?: string;
}

interface Props {
  items: ItemCarrusel[];
  seleccionado: number;
  onSeleccionar: (indice: number) => void;
}

/**
 * Selector de jugadores que queda fijo arriba mientras se baja por la hoja.
 * Hasta 3 jugadores se reparten el ancho; con más, es un carrusel que se desliza y deja siempre
 * al jugador activo en el centro (el anterior y el siguiente asoman a los costados).
 */
export function CarruselJugadores({ items, seleccionado, onSeleccionar }: Props) {
  const activoRef = useRef<HTMLButtonElement | null>(null);
  const fijo = items.length <= 3;

  useEffect(() => {
    if (fijo) return;
    activoRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [seleccionado, fijo]);

  return (
    <nav aria-label="Jugadores" className="sticky top-0 z-20 -mx-4 px-4 pb-2 pt-1">
      <div
        role="tablist"
        className={`rounded-3xl bg-slate-950/85 shadow-lg shadow-black/30 ring-1 ring-white/15 backdrop-blur-md ${
          fijo ? 'selector-jugadores-fijo' : 'selector-jugadores'
        }`}
        style={fijo ? { gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` } : undefined}
      >
        {items.map((item) => {
          const activo = item.indice === seleccionado;
          return (
            <button
              key={item.id + item.indice}
              ref={activo ? activoRef : undefined}
              type="button"
              role="tab"
              aria-selected={activo}
              onClick={() => onSeleccionar(item.indice)}
              className={`chip-jugador ${activo ? 'chip-jugador-activo' : ''}`}
            >
              <span className={`w-full truncate text-center font-black ${activo ? 'text-lg' : 'text-base'}`}>
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
