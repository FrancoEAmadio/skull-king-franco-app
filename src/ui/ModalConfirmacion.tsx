import type { ReactNode } from 'react';
import { EncabezadoModal, Modal } from './Modal';

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
    <Modal abierto={abierto} onCerrar={onCancelar} ancho="max-w-sm" zIndex={zIndex} cerrarAlHacerClickAfuera>
      <EncabezadoModal titulo={titulo} onCerrar={onCancelar} tono="rojo" />
      <div className="flex flex-col gap-3 p-4">
        <div className="text-base font-semibold text-tinta">{descripcion}</div>
        {advertencia && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-relaxed text-red-800">{advertencia}</div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2.5 border-t border-slate-200 p-4">
        <button type="button" onClick={onCancelar} className="btn-claro py-3 text-sm">
          Cancelar
        </button>
        <button type="button" onClick={onConfirmar} className="btn-peligro py-3 text-sm">
          {textoConfirmar}
        </button>
      </div>
    </Modal>
  );
}
