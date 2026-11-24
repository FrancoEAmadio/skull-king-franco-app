import { useRef, useState } from 'react';
import { useApp } from '../../estado/AppProvider';
import {
  combinarCopiaSeguridad,
  nombreArchivoCopia,
  crearCopiaSeguridad,
  interpretarCopiaSeguridad,
} from '../../infra/almacenamiento';
import { copiarLink, descargarArchivo } from '../../infra/compartir';
import { VERSION_APP } from '../../constantes';
import { buscarActualizacion, limpiarYRecargar } from '../../actualizar';
import { Toggle } from '../../ui/Toggle';
import { ModalFeedback } from './ModalFeedback';
import { EncabezadoModal, Modal } from '../../ui/Modal';
import { configurarVibracion, vibracionSoportada, vibrar } from '../../infra/vibracion';
import { ModalAviso } from '../../ui/ModalAviso';

export function ModalAjustes() {
  const {
    ajustesAbiertos,
    setAjustesAbiertos,
    ajustes,
    cambiarAjustes,
    jugadoresPermanentes,
    reemplazarJugadoresPermanentes,
    partida,
  } = useApp();
  const { historialPartidas, reemplazarHistorial } = partida;
  const archivoRef = useRef<HTMLInputElement>(null);
  const [aviso, setAviso] = useState<{ titulo: string; mensaje: string } | null>(null);
  const [feedbackAbierto, setFeedbackAbierto] = useState(false);
  const [linkCopiado, setLinkCopiado] = useState(false);
  const [estadoActualizacion, setEstadoActualizacion] = useState<string | null>(null);

  const buscarNovedades = async () => {
    setEstadoActualizacion('Buscando…');
    const r = await buscarActualizacion();
    setEstadoActualizacion(
      r === 'nueva'
        ? 'Hay una versión nueva: se está instalando y la app se recarga sola.'
        : r === 'actual'
          ? 'Ya tenés la última versión.'
          : 'No se pudo comprobar. Revisá la conexión o usá "Limpiar y recargar".'
    );
  };

  const copiar = async () => {
    const ok = await copiarLink();
    setLinkCopiado(ok);
    window.setTimeout(() => setLinkCopiado(false), 2200);
  };

  const cerrar = () => setAjustesAbiertos(false);

  const exportar = () => {
    const copia = crearCopiaSeguridad(jugadoresPermanentes, historialPartidas);
    descargarArchivo(nombreArchivoCopia(historialPartidas.length), JSON.stringify(copia, null, 2));
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

  const wakeLockOk = typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  const vibrarOk = vibracionSoportada();

  return (
    <>
      <Modal abierto={ajustesAbiertos} onCerrar={cerrar} ancho="max-w-md" zIndex="z-[60]" cerrarAlHacerClickAfuera>
        <EncabezadoModal titulo="Ajustes" subtitulo="Preferencias y datos" onCerrar={cerrar} />

        <div className="scroll-oculto flex flex-1 flex-col gap-3 overflow-y-auto bg-slate-50 p-4">
          <section className="tarjeta flex flex-col gap-1 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="block text-sm font-bold text-tinta">Pantalla siempre encendida</span>
                <span className="block text-xs text-slate-500">
                  {wakeLockOk ? 'Durante la partida.' : 'No disponible en este dispositivo.'}
                </span>
              </div>
              <Toggle
                etiqueta="Pantalla siempre encendida"
                disabled={!wakeLockOk}
                checked={wakeLockOk && ajustes.mantenerPantallaEncendida}
                onChange={(valor) => cambiarAjustes({ mantenerPantallaEncendida: valor })}
              />
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-1">
              <div className="min-w-0">
                <span className="block text-sm font-bold text-tinta">Vibración al tocar</span>
                <span className="block text-xs text-slate-500">
                  {vibrarOk ? 'Respuesta táctil en los botones.' : 'No disponible en este dispositivo.'}
                </span>
              </div>
              <Toggle
                etiqueta="Vibración al tocar"
                disabled={!vibrarOk}
                checked={vibrarOk && ajustes.vibracion}
                onChange={(valor) => {
                  cambiarAjustes({ vibracion: valor });
                  if (valor) {
                    configurarVibracion(true);
                    vibrar(30);
                  }
                }}
              />
            </div>
            <button type="button" onClick={() => void copiar()} className="btn-claro mt-2 w-full py-3 text-sm">
              {linkCopiado ? '✅ ¡Link copiado!' : '🔗 Copiar link de la página'}
            </button>
          </section>

          <section className="tarjeta p-4">
            <h4 className="tarjeta-titulo">💾 Copia de seguridad</h4>
            <p className="mb-3 mt-1 text-xs leading-relaxed text-slate-500">
              {jugadoresPermanentes.length} jugador{jugadoresPermanentes.length === 1 ? '' : 'es'} ·{' '}
              {historialPartidas.length} partida{historialPartidas.length === 1 ? '' : 's'} en este dispositivo. Al importar, se suman sin borrar nada.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={exportar} className="btn-primario py-3 text-sm">
                ⬇ Exportar
              </button>
              <button type="button" onClick={() => archivoRef.current?.click()} className="btn-claro py-3 text-sm">
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
          </section>

          <section className="tarjeta p-4">
            <h4 className="tarjeta-titulo">Información de la app</h4>
            <ul className="mt-2 flex flex-col gap-1 text-sm text-slate-600">
              <li>Versión: <strong className="text-tinta">{VERSION_APP}</strong></li>
              <li>Pantalla: <strong className="text-tinta">{window.innerWidth} px de ancho</strong> · densidad {Math.round(window.devicePixelRatio * 100) / 100}×</li>
            </ul>
            <button type="button" onClick={() => void buscarNovedades()} className="btn-claro mt-3 w-full py-3 text-sm">
              🔄 Buscar actualizaciones
            </button>
            {estadoActualizacion && <p className="mt-2 text-sm text-slate-600">{estadoActualizacion}</p>}
            <button
              type="button"
              onClick={() => void limpiarYRecargar()}
              className="mt-2 w-full py-2 text-xs text-slate-500 underline"
            >
              Si algo se ve viejo: limpiar archivos guardados y recargar (no borra tus partidas)
            </button>
          </section>

          <section className="tarjeta p-4">
            <h4 className="tarjeta-titulo">Tu opinión</h4>
            <button type="button" onClick={() => setFeedbackAbierto(true)} className="btn-claro mt-3 w-full py-3 text-sm">
              💬 Enviar comentarios o reportar error
            </button>
          </section>
        </div>
      </Modal>

      <ModalFeedback abierto={feedbackAbierto} onCerrar={() => setFeedbackAbierto(false)} />

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
