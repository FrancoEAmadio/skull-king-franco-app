import { useMemo, useState } from 'react';
import { useApp } from '../../estado/AppProvider';
import { construirSeriesEvolucion } from '../../dominio/comparativas';
import { compartirTarjetaResultado, compartirTexto, textoResultado } from '../../infra/compartir';
import type { DatosResultado, ResultadoCompartir } from '../../infra/compartir';
import { GraficoEvolucion } from '../../ui/GraficoEvolucion';
import { Modal } from '../../ui/Modal';
import { ModalAviso } from '../../ui/ModalAviso';

const MENSAJES: Record<ResultadoCompartir, string | null> = {
  compartido: null,
  cancelado: null,
  copiado: 'Resultado copiado al portapapeles.',
  descargado: 'La tarjeta se descargó como imagen PNG.',
  error: 'No se pudo compartir desde este dispositivo.',
};

export function ModalPodio() {
  const { mostrarPodio, cerrarPodio, partida, verHistorialJugador } = useApp();
  const { tablaGeneralOrdenada, partidaFinalizada, rondaActual, resumenRondaActual } = partida;
  const [aviso, setAviso] = useState<string | null>(null);
  const [trabajando, setTrabajando] = useState(false);

  const evolucion = useMemo(
    () => construirSeriesEvolucion(tablaGeneralOrdenada),
    [tablaGeneralOrdenada]
  );
  const rondasJugadas = Math.max(0, ...tablaGeneralOrdenada.map((jugador) => jugador.historial.length));

  const datos: DatosResultado = {
    ranking: tablaGeneralOrdenada.map((jugador) => ({ nombre: jugador.nombre, puntos: jugador.puntos })),
    fecha: new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    rondas: rondasJugadas || (resumenRondaActual.length ? rondaActual : 0),
    series: evolucion,
  };

  const ejecutar = async (accion: () => Promise<ResultadoCompartir>) => {
    if (trabajando) return;
    setTrabajando(true);
    try {
      const resultado = await accion();
      setAviso(MENSAJES[resultado]);
    } finally {
      setTrabajando(false);
    }
  };

  return (
    <>
      <Modal abierto={mostrarPodio} onCerrar={cerrarPodio} ancho="max-w-sm" cerrarAlHacerClickAfuera={!partidaFinalizada}>
        <div className="flex shrink-0 items-center justify-between border-b border-amber-900/60 p-4">
          <div>
            <h3 className="text-2xl font-bold text-amber-300">
              🏆 {partidaFinalizada ? 'Resultado Final' : 'Tabla General'}
            </h3>
            <span className="text-sm text-slate-400">
              {rondasJugadas} ronda{rondasJugadas === 1 ? '' : 's'} jugada{rondasJugadas === 1 ? '' : 's'}
            </span>
          </div>
          <button
            type="button"
            onClick={cerrarPodio}
            aria-label="Cerrar tabla general"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-xl font-bold text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="scroll-oculto flex flex-col gap-2 overflow-y-auto p-4">
          {tablaGeneralOrdenada.map((jugador, index) => (
            <button
              type="button"
              key={jugador.nombre}
              onClick={() => verHistorialJugador(jugador)}
              className={`flex items-center justify-between rounded-xl border p-3 text-left shadow-sm transition-transform hover:scale-[1.01] ${
                index === 0 ? 'btn-blanco-marron' : 'btn-marron-oscuro'
              }`}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="w-7 shrink-0 text-center text-xl font-bold">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="block truncate font-bold">{jugador.nombre}</span>
                  <span className="mt-0.5 text-sm opacity-80">🔍 Ver auditoría</span>
                </span>
              </span>
              <span className={`shrink-0 pl-2 text-2xl font-extrabold ${index === 0 ? '' : 'text-amber-300'}`}>
                {jugador.puntos} pts
              </span>
            </button>
          ))}

          <div className="mt-2 rounded-xl border border-slate-700 bg-slate-900/60 p-3">
            <h4 className="mb-2 text-sm font-black uppercase tracking-wider text-amber-300">
              Evolución por ronda
            </h4>
            {rondasJugadas >= 1 ? (
              <GraficoEvolucion series={evolucion.series} etiquetas={evolucion.etiquetas} />
            ) : (
              <p className="text-sm text-slate-400">Todavía no hay rondas cerradas.</p>
            )}
          </div>
        </div>

        <div className="grid shrink-0 gap-2 border-t border-amber-900/60 p-4">
          {rondasJugadas >= 1 && (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={trabajando}
                onClick={() => void ejecutar(() => compartirTexto('Skull King', textoResultado(datos)))}
                className="btn-marron-oscuro rounded-xl py-3 text-base disabled:opacity-60"
              >
                📤 Compartir
              </button>
              <button
                type="button"
                disabled={trabajando}
                onClick={() => void ejecutar(() => compartirTarjetaResultado(datos))}
                className="btn-marron-oscuro rounded-xl py-3 text-base disabled:opacity-60"
              >
                🖼️ Tarjeta (PNG)
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={cerrarPodio}
            className="btn-blanco-marron w-full rounded-2xl py-3.5 text-lg font-bold"
          >
            {partidaFinalizada ? '🏁 Finalizar y Guardar' : '← Volver a la Partida'}
          </button>
        </div>
      </Modal>

      <ModalAviso
        abierto={aviso !== null}
        titulo="Compartir"
        mensaje={aviso}
        onCerrar={() => setAviso(null)}
        textoBoton="OK"
        zIndex="z-[80]"
      />
    </>
  );
}
