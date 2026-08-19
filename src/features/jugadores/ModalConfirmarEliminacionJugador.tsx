import type { JugadorPermanente } from '../../tipos';
import { ModalConfirmacion } from '../../ui/ModalConfirmacion';

interface Props {
  jugador: JugadorPermanente | null;
  onCancelar: () => void;
  onConfirmar: () => void;
}

export function ModalConfirmarEliminacionJugador({ jugador, onCancelar, onConfirmar }: Props) {
  return (
    <ModalConfirmacion
      abierto={jugador !== null}
      titulo="Eliminar pirata"
      descripcion={
        jugador && (
          <>
            ¿Estás seguro de que querés eliminar a{' '}
            <span className="text-amber-300">{jugador.nombre}</span>?
          </>
        )
      }
      advertencia="Se eliminarán su tarjeta y todas sus estadísticas guardadas. Esta acción no se puede deshacer."
      textoConfirmar="Eliminar"
      onCancelar={onCancelar}
      onConfirmar={onConfirmar}
    />
  );
}
