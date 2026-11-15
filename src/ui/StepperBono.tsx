import { vibrar } from '../infra/vibracion';

interface Props {
  nombre: string;
  detalle: string;
  cantidad: number;
  maximo: number;
  onMas: () => void;
  onMenos: () => void;
  /** Motivo corto cuando el + está deshabilitado por tope. */
  motivoTope?: string;
}

/** Fila con − [n] + de objetivos grandes (≥ 44 px). */
export function StepperBono({ nombre, detalle, cantidad, maximo, onMas, onMenos, motivoTope }: Props) {
  const enTope = cantidad >= maximo;
  return (
    <div className={`rounded-xl border p-2.5 ${cantidad > 0 ? 'border-oro bg-amber-50' : 'border-slate-200 bg-slate-50'}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <span className="block text-sm font-semibold leading-tight text-tinta">{nombre}</span>
          <span className="block text-xs font-semibold text-slate-500">{detalle}</span>
        </div>
        <div className="stepper" role="group" aria-label={nombre}>
          <button
            type="button"
            className="stepper-btn"
            disabled={cantidad <= 0}
            aria-label={`Quitar ${nombre}`}
            onClick={() => {
              vibrar();
              onMenos();
            }}
          >
            −
          </button>
          <span className="stepper-valor" aria-live="polite">
            {cantidad}
          </span>
          <button
            type="button"
            className="stepper-btn"
            disabled={enTope}
            aria-label={`Sumar ${nombre}`}
            onClick={() => {
              vibrar();
              onMas();
            }}
          >
            +
          </button>
        </div>
      </div>
      {enTope && motivoTope && <p className="mt-1.5 text-xs font-semibold text-amber-700">{motivoTope}</p>}
    </div>
  );
}
