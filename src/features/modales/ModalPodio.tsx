import { useApp } from '../../estado/AppProvider';
import { Modal } from '../../ui/Modal';

export function ModalPodio() {
  const { mostrarPodio, cerrarPodio, partida, verHistorialJugador } = useApp();
  const { tablaGeneralOrdenada, partidaFinalizada } = partida;

  return (
    <Modal abierto={mostrarPodio} onCerrar={cerrarPodio} ancho="max-w-sm" cerrarAlHacerClickAfuera>
      <div className="flex justify-between items-center border-b border-amber-900/60 p-4 shrink-0">
        <h3 className="text-xl font-bold text-amber-300">🏆 Tabla General de Puntos</h3>
        <button
          onClick={cerrarPodio}
          className="text-slate-400 hover:text-white font-bold text-lg"
        >
          ✕
        </button>
      </div>
      <div className="flex flex-col gap-2 my-2 p-4 overflow-y-auto scroll-oculto">
        {tablaGeneralOrdenada.map((jugador, index) => (
          <div
            key={jugador.nombre}
            onClick={() => verHistorialJugador(jugador)}
            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer hover:scale-[1.02] transition-transform shadow-sm ${
              index === 0 ? 'btn-blanco-marron' : 'btn-marron-oscuro'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="font-bold text-lg w-6">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
              </span>
              <div className="flex flex-col">
                <span className="font-bold block">{jugador.nombre}</span>
                <span className="text-[10px] opacity-80 mt-0.5">🔍 Ver auditoría</span>
              </div>
            </div>
            <span className="font-extrabold text-xl text-amber-300">{jugador.puntos} pts</span>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-amber-900/60">
        <button
          onClick={cerrarPodio}
          className="w-full py-3.5 btn-blanco-marron text-base rounded-2xl font-bold"
        >
          {partidaFinalizada ? '🏁 Finalizar y Guardar' : '← Volver a la Partida'}
        </button>
      </div>
    </Modal>
  );
}
