import { vibrar } from '../infra/vibracion';

interface Props {
  nombre: string;
  detalle: string;
  cantidad: number;
  maximo: number;
  onTocar: () => void;
}

/**
 * Toque = suma uno. Al llegar al máximo, el siguiente toque vuelve a cero.
 * Si ya no queda disponible (lo usaron otros jugadores) queda apagada.
 */
export function PildoraBono({ nombre, detalle, cantidad, maximo, onTocar }: Props) {
  const activa = cantidad > 0;
  const sinStock = maximo <= 0 && cantidad === 0;

  return (
    <button
      type="button"
      disabled={sinStock}
      onClick={() => {
        vibrar();
        onTocar();
      }}
      aria-label={`${nombre}: ${cantidad}. ${detalle}`}
      className={`pildora-bono ${activa ? 'pildora-bono-activa' : ''}`}
    >
      <span className="text-base font-extrabold leading-tight">{nombre}</span>
      <span className={`text-sm font-bold ${activa ? 'text-amber-950/80' : 'text-amber-300'}`}>{detalle}</span>
      <span className="pildora-contador" aria-hidden="true">
        {cantidad}
      </span>
    </button>
  );
}
