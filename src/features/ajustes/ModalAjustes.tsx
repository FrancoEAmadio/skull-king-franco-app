import { useRef, useState } from 'react';
import { useApp } from '../../estado/AppProvider';
import {
  combinarCopiaSeguridad,
  crearCopiaSeguridad,
  interpretarCopiaSeguridad,
} from '../../infra/almacenamiento';
import { descargarArchivo } from '../../infra/compartir';
import { InsigniaAutoria } from '../../ui/InsigniaAutoria';
import { Modal } from '../../ui/Modal';
import { ModalAviso } from '../../ui/ModalAviso';

export function ModalAjustes() {
  const { ajustesAbiertos, setAjustesAbiertos, jugadoresPermanentes, reemplazarJugadoresPermanentes, partida } =
    useApp();
  const { historialPartidas, reemplazarHistorial } = partida;
  const archivoRef = useRef<HTMLInputElement>(null);
  const [aviso, setAviso] = useState<{ titulo: string; mensaje: string } | null>(null);

  const cerrar = () => setAjustesAbiertos(false);

  const exportar = () => {
    const copia = crearCopiaSeguridad(jugadoresPermanentes, historialPartidas);
    const fecha = new Date().toISOString().slice(0, 10);
    descargarArchivo(`skull-king-copia-${fecha}.json`, JSON.stringify(copia, null, 2));
    setAviso({
      titulo: 'Copia exportada',
      mensaje: `Se descargó un archivo con ${jugadoresPermanentes.length} jugador${
        jugadoresPermanentes.length === 1 ? '' : 'es'
      } y ${historialPartidas.length} partida${historialPartidas.length === 1 ? '' : 's'}.`,
    });
  };

  const importar = async (archivo: File | undefined) => {
    if (!archivo) return;
    let texto = '';
    try {
      texto = await archivo.text();
    } catch {
      setAviso({ titulo: 'No se pudo leer', mensaje: 'El archivo no se pudo abrir en este dispositivo.' });
      return;
    } finally {
      if (archivoRef.current) archivoRef.current.value = '';
    }

    const resultado = interpretarCopiaSeguridad(texto);
    if (!resultado.ok) {
      setAviso({ titulo: 'Archivo no válido', mensaje: resultado.motivo });
      return;
    }

    const combinado = combinarCopiaSeguridad(jugadoresPermanentes, historialPartidas, resultado.copia);
    reemplazarJugadoresPermanentes(combinado.jugadores);
    reemplazarHistorial(combinado.historial);

    const partes = [
      `${combinado.jugadoresNuevos} jugador${combinado.jugadoresNuevos === 1 ? '' : 'es'} nuevo${
        combinado.jugadoresNuevos === 1 ? '' : 's'
      }`,
      `${combinado.partidasNuevas} partida${combinado.partidasNuevas === 1 ? '' : 's'} nueva${
        combinado.partidasNuevas === 1 ? '' : 's'
      }`,
    ];
    const extra: string[] = [];
    if (combinado.partidasRepetidas > 0) extra.push(`${combinado.partidasRepetidas} repetida(s) omitida(s)`);
    if (combinado.jugadoresActualizados > 0) extra.push(`${combinado.jugadoresActualizados} jugador(es) actualizado(s)`);
    if (resultado.descartados > 0) extra.push(`${resultado.descartados} registro(s) inválido(s) descartado(s)`);
    setAviso({
      titulo: 'Copia importada',
      mensaje: `Se sumaron ${partes.join(' y ')}.${extra.length ? ` (${extra.join(', ')})` : ''}`,
    });
  };

  return (
    <>
      <Modal abierto={ajustesAbiertos} onCerrar={cerrar} ancho="max-w-md" zIndex="z-[60]" cerrarAlHacerClickAfuera>
        <div className="flex shrink-0 items-center justify-between border-b border-amber-900/60 bg-slate-900 p-4">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-amber-300">Ajustes</h3>
            <span className="text-xl font-bold text-white">Datos e información</span>
          </div>
          <button
            type="button"
            onClick={cerrar}
            aria-label="Cerrar ajustes"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-xl font-bold text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="scroll-oculto flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
            <h4 className="text-sm font-black text-amber-300">💾 Copia de seguridad</h4>
            <p className="mb-3 mt-1 text-xs leading-relaxed text-slate-300">
              Tus jugadores, estadísticas e historial viven solo en este dispositivo. Exportalos a un archivo
              .json para guardarlos o pasarlos a otro celular, y después importalos desde ahí.
            </p>
            <p className="mb-3 text-[11px] text-slate-400">
              Ahora: {jugadoresPermanentes.length} jugador{jugadoresPermanentes.length === 1 ? '' : 'es'} ·{' '}
              {historialPartidas.length} partida{historialPartidas.length === 1 ? '' : 's'} en el historial.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={exportar} className="btn-blanco-marron rounded-xl py-3 text-sm">
                ⬇ Exportar
              </button>
              <button
                type="button"
                onClick={() => archivoRef.current?.click()}
                className="btn-marron-oscuro rounded-xl py-3 text-sm"
              >
                ⬆ Importar
              </button>
            </div>
            <input
              ref={archivoRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(evento) => void importar(evento.target.files?.[0])}
            />
            <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
              Al importar, los datos se suman a los actuales: no se borra nada y las partidas repetidas se
              omiten.
            </p>
          </section>

          <InsigniaAutoria variante="completa" />
        </div>
      </Modal>

      <ModalAviso
        abierto={aviso !== null}
        titulo={aviso?.titulo ?? ''}
        mensaje={aviso?.mensaje ?? ''}
        onCerrar={() => setAviso(null)}
        textoBoton="OK"
        zIndex="z-[80]"
      />
    </>
  );
}
