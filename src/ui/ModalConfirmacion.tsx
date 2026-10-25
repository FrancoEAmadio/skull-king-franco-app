import type { ReactNode } from 'react';
import { Modal } from './Modal';

interface Props {
  abierto: boolean;
  titulo: string;
  descripcion: ReactNode;
  advertencia?: ReactNode;
  textoConfirmar: string;
  onCancelar: () => void;
  onConfirmar: () => void;
  zIndex?: string;
}

export function ModalConfirmacion({
  abierto,
  titulo,
  descripcion,
  advertencia,
  textoConfirmar,
  onCancelar,
  onConfirmar,
  zIndex = 'z-[70]',
}: Props) {
  return (
    <Modal
      abierto={abierto}
      onCerrar={onCancelar}
      ancho="max-w-sm"
      zIndex={zIndex}
      cerrarAlHacerClickAfuera
    >
      <div className="flex items-center justify-between border-b border-red-900/60 bg-slate-900 p-4">
        <h3 className="text-xl font-black text-red-300">{titulo}</h3>
        <button
          type="button"
          onClick={onCancelar}
          aria-label={`Cancelar: ${titulo}`}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-2xl font-bold text-slate-400 hover:bg-slate-700 hover:text-white"
        >
          ×
        </button>
      </div>

      <div className="flex flex-col gap-3 p-5">
        <div className="text-lg font-bold text-white">{descripcion}</div>
        {advertencia && (
          <div className="rounded-xl border border-red-900/70 bg-red-950/40 p-3 text-base leading-relaxed text-red-200">
            {advertencia}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2.5 border-t border-red-900/60 p-4">
        <button
          type="button"
          onClick={onCancelar}
          className="btn-marron-oscuro rounded-xl py-3 text-base font-bold"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirmar}
          className="rounded-xl border border-red-700 bg-red-950/90 py-3 text-base font-black text-red-200 hover:bg-red-900"
        >
          {textoConfirmar}
        </button>
      </div>
    </Modal>
  );
}
