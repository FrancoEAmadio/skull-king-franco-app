import type { JugadorPermanente } from '../../tipos';
import { Modal } from '../../ui/Modal';

interface Props {
  jugador: JugadorPermanente | null;
  onCancelar: () => void;
  onConfirmar: () => void;
}

export function ModalConfirmarEliminacionJugador({ jugador, onCancelar, onConfirmar }: Props) {
  return (
    <Modal
      abierto={jugador !== null}
      onCerrar={onCancelar}
      ancho="max-w-sm"
      zIndex="z-[70]"
      cerrarAlHacerClickAfuera
    >
      {jugador && (
        <>
          <div className="flex items-center justify-between border-b border-red-900/60 bg-slate-900 p-4">
            <h3 className="text-lg font-black text-red-300">Eliminar pirata</h3>
            <button
              type="button"
              onClick={onCancelar}
              aria-label="Cancelar eliminación"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-xl font-bold text-slate-400 hover:bg-slate-700 hover:text-white"
            >
              ×
            </button>
          </div>

          <div className="flex flex-col gap-3 p-5">
            <p className="text-base font-bold text-white">
              ¿Estás seguro de que querés eliminar a{' '}
              <span className="text-amber-300">{jugador.nombre}</span>?
            </p>
            <p className="rounded-xl border border-red-900/70 bg-red-950/40 p-3 text-sm leading-relaxed text-red-200">
              Se eliminarán su tarjeta y todas sus estadísticas guardadas. Esta acción no se puede deshacer.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 border-t border-red-900/60 p-4">
            <button
              type="button"
              onClick={onCancelar}
              className="btn-marron-oscuro rounded-xl py-3 text-sm font-bold"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirmar}
              className="rounded-xl border border-red-700 bg-red-950/90 py-3 text-sm font-black text-red-200 hover:bg-red-900"
            >
              Eliminar
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
