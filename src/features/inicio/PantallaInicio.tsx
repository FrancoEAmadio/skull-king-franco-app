import { useState } from 'react';
import { useApp } from '../../estado/AppProvider';
import { useInstalarPWA } from '../../ui/useInstalarPWA';
import { Modal } from '../../ui/Modal';
import { ModalConfirmacion } from '../../ui/ModalConfirmacion';

function formatearFecha(iso: string): string {
  try {
    return new Date(iso).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export function PantallaInicio() {
  const { setPantallaActual, partida, setAjustesAbiertos } = useApp();
  const { puedeInstalar, instalar, mostrarAyudaIOS } = useInstalarPWA();
  const [eligiendo, setEligiendo] = useState(false);
  const [aDescartar, setADescartar] = useState<string | null>(null);

  const continuar = () => {
    if (partida.partidasGuardadas.length === 1) partida.continuarPartida(partida.partidasGuardadas[0].id);
    else setEligiendo(true);
  };

  return (
    <main className="entrar relative mx-auto my-auto flex w-full max-w-xl flex-col items-center py-4 text-center">
      <button
        type="button"
        onClick={() => setAjustesAbiertos(true)}
        aria-label="Ajustes y copia de seguridad"
        className="btn-fantasma absolute right-0 top-0 h-11 w-11 !rounded-full p-0"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3.2" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.65 8.9a1.7 1.7 0 0 0-.34-1.87l-.06-.06A2 2 0 1 1 7.08 4.14l.06.06a1.7 1.7 0 0 0 1.87.34h0A1.7 1.7 0 0 0 10.04 3V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v0A1.7 1.7 0 0 0 21 10.04H21a2 2 0 1 1 0 4h-.09A1.7 1.7 0 0 0 19.4 15z" />
        </svg>
      </button>
      <img
        src={`${import.meta.env.BASE_URL}archivos/iconos/tapa.png`}
        alt=""
        draggable={false}
        className="mx-auto mt-8 w-36 rounded-lg shadow-[0_6px_18px_rgba(0,0,0,0.55)]"
      />
      <h1 className="mt-5">
        <img
          src={`${import.meta.env.BASE_URL}archivos/logo-skull-king.png`}
          alt="Skull King"
          draggable={false}
          className="mx-auto w-52 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
        />
      </h1>
      <p className="mb-9 mt-2 text-xs font-semibold uppercase tracking-[0.25em] text-white">Anotador de puntos y manual</p>

      <div className="flex w-full flex-col gap-4">
        <button type="button" onClick={partida.irANuevaPartida} className="btn-dorado w-full py-5 text-lg">
          Nueva Partida
        </button>
        {partida.hayPartidaGuardada && (
          <button type="button" onClick={continuar} className="btn-oscuro latir w-full py-5 text-lg">
            Continuar Partida{partida.partidasGuardadas.length > 1 ? ` (${partida.partidasGuardadas.length})` : ''}
          </button>
        )}
        <button type="button" onClick={() => setPantallaActual('jugadores')} className="btn-claro w-full py-5 text-lg">
          Jugadores, Estadísticas e Historial
        </button>
        <button type="button" onClick={() => setPantallaActual('reglas')} className="btn-claro w-full py-5 text-lg">
          Manual, Cartas y Reglas
        </button>
      </div>

      <div className="mt-6 flex w-full flex-col items-center gap-2">
        {puedeInstalar && (
          <button type="button" onClick={() => void instalar()} className="btn-fantasma w-full py-3 text-sm">
            Instalar la app en este dispositivo
          </button>
        )}
        {mostrarAyudaIOS && (
          <p className="text-xs text-amber-100">Para instalarla en iPhone: tocá Compartir y elegí «Añadir a pantalla de inicio».</p>
        )}
      </div>

      <Modal abierto={eligiendo} onCerrar={() => setEligiendo(false)} ancho="max-w-md" cerrarAlHacerClickAfuera>
        <div className="flex max-h-[85dvh] flex-col gap-3 overflow-y-auto p-4 text-left">
          <h2 className="font-display text-xl font-bold text-azul">Elegí qué partida continuar</h2>
          {partida.partidasGuardadas.map((p) => (
            <div key={p.id} className="opcion flex items-center gap-2 p-3">
              <button
                type="button"
                className="min-w-0 flex-1 text-left"
                onClick={() => { setEligiendo(false); partida.continuarPartida(p.id); }}
              >
                <span className="block truncate text-sm font-semibold text-tinta">
                  {p.jugadores.map((j) => j.nombre).join(', ')}
                </span>
                <span className="block text-xs font-semibold text-slate-500">
                  Ronda {p.rondaActual} de {p.cartasPorRondaActivas.length || 10} · {formatearFecha(p.actualizada)}
                </span>
              </button>
              <button
                type="button"
                className="btn-peligro shrink-0 px-3 py-2 text-xs"
                onClick={() => setADescartar(p.id)}
              >
                Borrar
              </button>
            </div>
          ))}
          <button type="button" onClick={() => setEligiendo(false)} className="btn-claro w-full py-3">
            Cerrar
          </button>
        </div>
      </Modal>

      <ModalConfirmacion
        abierto={aDescartar !== null}
        titulo="¿Borrar esta partida?"
        descripcion="Se descarta la partida sin guardarla en el historial."
        textoConfirmar="Borrar"
        onConfirmar={() => {
          if (aDescartar) partida.descartarPartidaPorId(aDescartar);
          setADescartar(null);
          if (partida.partidasGuardadas.length <= 1) setEligiendo(false);
        }}
        onCancelar={() => setADescartar(null)}
        zIndex="z-[70]"
      />
    </main>
  );
}
