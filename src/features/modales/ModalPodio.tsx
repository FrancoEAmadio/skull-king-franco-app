import { useMemo, useState } from 'react';
import { useApp } from '../../estado/AppProvider';
import { construirSeriesEvolucion } from '../../dominio/comparativas';
import { compartirTarjetaResultado, compartirTexto, textoResultado } from '../../infra/compartir';
import type { DatosResultado, ResultadoCompartir } from '../../infra/compartir';
import { GraficoEvolucion } from '../../ui/GraficoEvolucion';
import { EncabezadoModal, Modal } from '../../ui/Modal';
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
        <EncabezadoModal
          titulo={`🏆 ${partidaFinalizada ? 'Resultado final' : 'Tabla general'}`}
          subtitulo={`${rondasJugadas} ronda${rondasJugadas === 1 ? '' : 's'} jugada${rondasJugadas === 1 ? '' : 's'}`}
          onCerrar={cerrarPodio}
        />

        <div className="scroll-oculto flex flex-col gap-2 overflow-y-auto p-4">
          {tablaGeneralOrdenada.map((jugador, index) => (
            <button
              type="button"
              key={jugador.nombre}
              onClick={() => verHistorialJugador(jugador)}
              className={`flex items-center justify-between p-3 text-left ${index === 0 ? 'opcion opcion-sel' : 'opcion'}`}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="w-7 shrink-0 text-center text-xl font-bold">
                  {index + 1}.º
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="block truncate font-display font-black text-azul">{jugador.nombre}</span>
                  <span className="text-xs text-slate-500">🔍 Ver auditoría</span>
                </span>
              </span>
              <span className="shrink-0 pl-2 text-xl font-black text-tinta">{jugador.puntos} pts</span>
            </button>
          ))}

          <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <h4 className="tarjeta-titulo mb-2">Evolución por ronda</h4>
            {rondasJugadas >= 1 ? (
              <GraficoEvolucion series={evolucion.series} etiquetas={evolucion.etiquetas} />
            ) : (
              <p className="text-sm text-slate-500">Todavía no hay rondas cerradas.</p>
            )}
          </div>
        </div>

        <div className="grid shrink-0 gap-2 border-t border-slate-200 p-4">
          {rondasJugadas >= 1 && (
            <div className="grid grid-cols-2 gap-2">
              <button type="button" disabled={trabajando} onClick={() => void ejecutar(() => compartirTexto('Skull King', textoResultado(datos)))} className="btn-claro py-3 text-sm">
                📤 Compartir
              </button>
              <button type="button" disabled={trabajando} onClick={() => void ejecutar(() => compartirTarjetaResultado(datos))} className="btn-claro py-3 text-sm">
                🖼️ Tarjeta (PNG)
              </button>
            </div>
          )}
          <button type="button" onClick={cerrarPodio} className="btn-dorado w-full py-3.5 text-base">
            {partidaFinalizada ? '🏁 Finalizar y guardar' : '← Volver a la partida'}
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
