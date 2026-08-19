import { useApp } from '../../estado/AppProvider';
import { Modal } from '../../ui/Modal';
import { calcularPromedioPuntos, calcularPorcentajeAciertos } from '../../dominio/estadisticas';

export function ModalEstadisticasJugador() {
  const { jugadorPermanenteViendoStats, cerrarEstadisticasJugador } = useApp();

  return (
    <Modal
      abierto={!!jugadorPermanenteViendoStats}
      onCerrar={cerrarEstadisticasJugador}
      ancho="max-w-md"
      zIndex="z-[70]"
      cerrarAlHacerClickAfuera
    >
      {jugadorPermanenteViendoStats && (
        <>
          <div className="flex justify-between items-center bg-slate-900 border-b border-amber-900/60 p-4 shrink-0">
            <div>
              <h3 className="text-sm font-black text-amber-300 tracking-widest uppercase">
                Perfil Pirata
              </h3>
              <span className="text-white font-bold text-2xl">
                🏴‍☠️ {jugadorPermanenteViendoStats.nombre}
              </span>
            </div>
            <button
              onClick={cerrarEstadisticasJugador}
              className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl w-10 h-10 flex items-center justify-center font-bold text-xl"
            >
              ✕
            </button>
          </div>

          <div className="overflow-y-auto flex-1 flex flex-col gap-4 scroll-oculto p-4">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="tarjeta-marron p-3 text-center">
                <span className="text-2xl font-black text-amber-300 block">
                  {jugadorPermanenteViendoStats.estadisticas.partidasJugadas}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Partidas</span>
              </div>
              <div className="tarjeta-marron p-3 text-center">
                <span className="text-2xl font-black text-emerald-400 block">
                  🥇 {jugadorPermanenteViendoStats.estadisticas.victorias}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Victorias</span>
              </div>
              <div className="tarjeta-marron p-3 text-center">
                <span className="text-2xl font-black text-slate-200 block">
                  🥈 {jugadorPermanenteViendoStats.estadisticas.segundoPuesto}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-bold">2º Puesto</span>
              </div>
              <div className="tarjeta-marron p-3 text-center">
                <span className="text-2xl font-black text-amber-600 block">
                  🥉 {jugadorPermanenteViendoStats.estadisticas.tercerPuesto}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-bold">3º Puesto</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="tarjeta-marron p-3 text-center">
                <span className="text-xl font-black text-white block">
                  {calcularPromedioPuntos(jugadorPermanenteViendoStats)}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-bold">
                  Promedio pts
                </span>
              </div>
              <div className="tarjeta-marron p-3 text-center">
                <span className="text-xl font-black text-white block">
                  {calcularPorcentajeAciertos(jugadorPermanenteViendoStats)}%
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-bold">
                  Envites acertados
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}
