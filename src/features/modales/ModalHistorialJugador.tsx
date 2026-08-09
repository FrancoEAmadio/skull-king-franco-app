import { useApp } from '../../estado/AppProvider';
import { Modal } from '../../ui/Modal';
import type { EntradaHistorialRonda } from '../../tipos';

export function ModalHistorialJugador() {
  const { jugadorViendoHistorial, cerrarHistorialJugador } = useApp();

  return (
    <Modal
      abierto={!!jugadorViendoHistorial}
      onCerrar={cerrarHistorialJugador}
      ancho="max-w-md"
      zIndex="z-[70]"
      cerrarAlHacerClickAfuera
    >
      {jugadorViendoHistorial && (
        <>
          <div className="flex justify-between items-center bg-slate-900 border-b border-amber-900/60 p-4 shrink-0 shadow-md">
            <div>
              <h3 className="text-sm font-black text-amber-300 tracking-widest uppercase">
                Auditoría de Puntaje
              </h3>
              <span className="text-white font-bold text-2xl">
                {jugadorViendoHistorial.nombre}
              </span>
            </div>
            <button
              onClick={cerrarHistorialJugador}
              className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl w-10 h-10 flex items-center justify-center font-bold text-xl"
            >
              ✕
            </button>
          </div>

          <div className="overflow-y-auto flex-1 flex flex-col gap-4 scroll-oculto p-4 overscroll-contain">
            {(jugadorViendoHistorial.historial as EntradaHistorialRonda[]).map((ronda) => (
              <div
                key={ronda.ronda}
                className="bg-slate-900 border border-slate-700 p-3.5 rounded-xl text-xs relative shadow-lg"
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    ronda.acierto ? 'bg-emerald-500' : 'bg-red-500'
                  }`}
                />
                <div className="flex justify-between items-center border-b border-slate-700/60 pb-2 mb-2 pl-3">
                  <span className="font-black text-amber-400 text-lg">
                    RONDA {ronda.ronda}
                  </span>
                  <span
                    className={`font-bold text-xs px-2 py-0.5 rounded ${
                      ronda.acierto
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-red-950 text-red-400 border border-red-800'
                    }`}
                  >
                    Envite: {ronda.apuesta} | Bazas: {ronda.ganadas}
                  </span>
                </div>

                <div className="pl-3 flex flex-col gap-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Puntaje Base:</span>
                    <span className="text-white font-bold">
                      {ronda.puntajeBase > 0 ? '+' : ''}
                      {ronda.puntajeBase}
                    </span>
                  </div>

                  {ronda.bonosCobradas.map((b, i) => (
                    <div key={`bc-${i}`} className="flex justify-between text-emerald-300">
                      <span>{b.etiqueta}:</span>
                      <span className="font-bold">
                        {b.subtotal > 0 ? '+' : ''}
                        {b.subtotal} pts
                      </span>
                    </div>
                  ))}

                  {ronda.bonosNoCobradas.map((b, i) => (
                    <div key={`bn-${i}`} className="flex justify-between text-slate-500 line-through">
                      <span>{b.etiqueta}:</span>
                      <span>+{b.subtotal} pts</span>
                    </div>
                  ))}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-700/80 pl-3 flex justify-between items-end">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold">
                      Total ronda
                    </span>
                    <span
                      className={`font-black text-lg block ${
                        ronda.totalRonda >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {ronda.totalRonda > 0 ? '+' : ''}
                      {ronda.totalRonda}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-amber-300/70 uppercase font-bold">
                      Acumulado
                    </span>
                    <span className="font-black text-xl text-amber-400 block">
                      {ronda.acumuladoNuevo}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Modal>
  );
}
