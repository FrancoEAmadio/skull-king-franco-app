import { useApp } from '../../estado/AppProvider';
import { EncabezadoModal, Modal } from '../../ui/Modal';
import type { EntradaHistorialRonda } from '../../tipos';

const signo = (n: number) => `${n > 0 ? '+' : ''}${n}`;

export function ModalHistorialJugador() {
  const { jugadorViendoHistorial, cerrarHistorialJugador } = useApp();

  return (
    <Modal abierto={!!jugadorViendoHistorial} onCerrar={cerrarHistorialJugador} ancho="max-w-md" zIndex="z-[70]" cerrarAlHacerClickAfuera>
      {jugadorViendoHistorial && (
        <>
          <EncabezadoModal titulo={jugadorViendoHistorial.nombre} subtitulo="Auditoría de puntaje" onCerrar={cerrarHistorialJugador} />

          <div className="scroll-oculto flex flex-1 flex-col gap-3 overflow-y-auto overscroll-contain bg-slate-50 p-4">
            {(jugadorViendoHistorial.historial as EntradaHistorialRonda[]).map((ronda) => (
              <div key={ronda.ronda} className="rounded-xl border border-slate-200 bg-white p-3.5 text-sm shadow-sm">
                <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-display text-base font-black text-azul">Ronda {ronda.ronda}</span>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-black ${
                      ronda.acierto ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-red-300 bg-red-50 text-red-700'
                    }`}
                  >
                    Envite {ronda.apuesta} · Bazas {ronda.ganadas}
                  </span>
                </div>

                <div className="flex flex-col">
                  <div className="fila-puntaje py-1">
                    <span className="fila-puntaje-nombre text-slate-600">Puntaje base</span>
                    <span className="fila-puntaje-valor">{signo(ronda.puntajeBase)}</span>
                  </div>
                  {ronda.bonosCobradas.map((b, i) => (
                    <div key={`bc-${i}`} className="fila-puntaje py-1">
                      <span className="fila-puntaje-nombre text-slate-600">{b.etiqueta}</span>
                      <span className={`fila-puntaje-valor ${b.subtotal < 0 ? 'text-rojo-osc' : 'text-emerald-700'}`}>{signo(b.subtotal)}</span>
                    </div>
                  ))}
                  {ronda.bonosNoCobradas.map((b, i) => (
                    <div key={`bn-${i}`} className="fila-puntaje py-1 text-slate-400">
                      <span className="fila-puntaje-nombre tachado-rojo">{b.etiqueta}</span>
                      <span className="fila-puntaje-valor tachado-rojo">{signo(b.subtotal)}</span>
                    </div>
                  ))}
                </div>

                <div className="fila-puntaje !items-end mt-2 border-t border-slate-100 pt-2">
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-slate-400">Total ronda</span>
                    <span className={`text-xl font-black ${ronda.totalRonda >= 0 ? 'text-azul' : 'text-rojo-osc'}`}>{signo(ronda.totalRonda)}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] font-bold uppercase text-slate-400">Acumulado</span>
                    <span className="text-2xl font-black text-tinta">{ronda.acumuladoNuevo}</span>
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
