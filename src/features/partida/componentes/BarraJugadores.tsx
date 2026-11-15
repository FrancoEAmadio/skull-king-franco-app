import { useSwipeHorizontal } from '../../../ui/useSwipeHorizontal';

export interface ItemBarra {
  id: string;
  nombre: string;
  detalle: string;
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

  const { iniciarTouch, finalizarTouch } = useSwipeHorizontal({
    onSwipeIzquierda: () => indice < cantidad - 1 && onIr(indice + 1),
    onSwipeDerecha: () => indice > 0 && onIr(indice - 1),
  });

  return (
    <div className="sticky top-0 z-20 -mx-4 px-4 pb-1 pt-[max(0.5rem,env(safe-area-inset-top))]">
      <div
        onTouchStart={iniciarTouch}
        onTouchEnd={finalizarTouch}
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
