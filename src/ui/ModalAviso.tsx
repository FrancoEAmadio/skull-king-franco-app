import type { ReactNode } from 'react';
import { Modal } from './Modal';

interface Props {
  abierto: boolean;
  titulo: string;
  mensaje: ReactNode;
  onCerrar: () => void;
  textoBoton?: string;
  zIndex?: string;
}

export function ModalAviso({
  abierto,
  titulo,
  mensaje,
  onCerrar,
  textoBoton = 'Entendido',
  zIndex = 'z-[70]',
}: Props) {
  return (
    <Modal abierto={abierto} onCerrar={onCerrar} ancho="max-w-xs" zIndex={zIndex}>
      <div className="border-b border-amber-900/60 bg-slate-900 p-4 text-center">
        <h3 className="text-xl font-black text-amber-300">{titulo}</h3>
      </div>
      <div className="p-5 text-center text-sm leading-relaxed text-slate-300">{mensaje}</div>
      <div className="border-t border-amber-900/60 p-4">
        <button
          type="button"
          onClick={onCerrar}
          className="btn-blanco-marron w-full rounded-xl py-3 text-sm font-black"
        >
          {textoBoton}
        </button>
      </div>
    </Modal>
  );
}
