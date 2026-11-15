export interface ItemBarra {
  id: string;
  nombre: string;
  detalle: string;
  /** Puntos que sumaría la ronda con lo cargado hasta ahora. */
  proyeccion?: number;
}

interface Props {
  items: ItemBarra[];
  indice: number;
  onIr: (posicion: number) => void;
}

/** Barra fija con 3 pestañas enteras del mismo ancho; el indicador blanco se desliza (igual que La Canasta). */
export function BarraJugadores({ items, indice, onIr }: Props) {
  const cantidad = items.length;
  const ventana = Math.min(3, cantidad);
  const desde = Math.max(0, Math.min(indice - 1, cantidad - 3));

  return (
    <div className="sticky top-0 z-20 sangrado pb-1 pt-[max(0.5rem,env(safe-area-inset-top))]">
      <div
        className="rounded-2xl bg-noche-2/90 p-1 shadow-lg shadow-black/30 ring-1 ring-white/15 backdrop-blur"
      >
        <div className="selector-ventana">
          <div
            role="tablist"
            aria-label="Jugadores"
            className="selector-pista"
            style={{ width: `${(cantidad / ventana) * 100}%`, transform: `translateX(-${(desde / cantidad) * 100}%)` }}
          >
            <span
              aria-hidden="true"
              className="selector-indicador"
              style={{ width: `${100 / cantidad}%`, transform: `translateX(${indice * 100}%)` }}
            >
              <span />
            </span>
            {items.map((item, posicion) => {
              const activo = posicion === indice;
              return (
                <button
                  key={item.id + posicion}
                  type="button"
                  role="tab"
                  aria-selected={activo}
                  title={item.nombre}
                  onClick={() => onIr(posicion)}
                  className={`selector-jugador ${activo ? 'text-azul' : 'text-white/80 active:bg-white/10'}`}
                >
                  <span className="selector-jugador-nombre text-xs font-black">{item.nombre}</span>
                  <span className={`selector-jugador-total text-[11px] font-bold ${activo ? 'text-azul-vivo' : 'opacity-75'}`}>
                    {item.detalle}
                    {item.proyeccion !== undefined && (
                      <span
                        className={`ml-1 text-[10px] font-black ${
                          item.proyeccion < 0 ? (activo ? 'text-rojo' : 'text-red-300') : activo ? 'text-emerald-600' : 'text-emerald-300'
                        }`}
                      >
                        {item.proyeccion > 0 ? '+' : ''}
                        {item.proyeccion}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
