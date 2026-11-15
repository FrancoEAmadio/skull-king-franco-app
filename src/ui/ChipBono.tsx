import { vibrar } from '../infra/vibracion';

interface Props {
  nombre: string;
  detalle: string;
  cantidad: number;
  maximo: number;
  onMas: () => void;
  onBorrar: () => void;
  motivoTope?: string;
}

/** Botón-chip: un toque lo marca, cada toque suma hasta el máximo y el siguiente lo borra. */
export function ChipBono({ nombre, detalle, cantidad, maximo, onMas, onBorrar, motivoTope }: Props) {
  const bloqueado = maximo <= 0 && cantidad === 0;
  const activo = cantidad > 0;
  return (
    <div>
      <button
        type="button"
        aria-pressed={activo}
        disabled={bloqueado}
        onClick={() => {
          vibrar();
          if (cantidad >= maximo) onBorrar();
          else onMas();
        }}
        className={`flex min-h-12 w-full items-center justify-between gap-2 px-3 py-2 text-left disabled:opacity-40 ${activo ? 'opcion opcion-sel' : 'opcion'}`}
      >
        <span className="min-w-0">
          <span className="block text-sm font-extrabold leading-tight text-tinta">{nombre}</span>
          <span className="block text-xs font-semibold text-slate-500">{detalle}</span>
        </span>
        {activo && maximo > 1 && (
          <span className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full bg-oro px-2 text-sm font-black text-tinta-oro">
            ×{cantidad}
          </span>
        )}
      </button>
      {bloqueado && motivoTope && <p className="mt-1 text-xs font-semibold text-amber-700">{motivoTope}</p>}
    </div>
  );
}
