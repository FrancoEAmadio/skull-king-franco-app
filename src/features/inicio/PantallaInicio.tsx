import { useState } from 'react';
import { useApp } from '../../estado/AppProvider';
import { useInstalarPWA } from '../../ui/useInstalarPWA';
import { EncabezadoModal, Modal } from '../../ui/Modal';
import { ModalConfirmacion } from '../../ui/ModalConfirmacion';
import type { ModoContenido } from '../../tipos';

const NOMBRE_MODO: Record<ModoContenido, string> = { base: 'Juego Base', avanzado: 'Avanzadas', expansion: 'Expansión' };

function formatearFecha(iso: string): string {
  try {
    return new Date(iso).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
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
    <main className="entrar relative mx-auto my-auto flex w-full max-w-xl flex-col items-center px-4 py-4 text-center md:px-0">
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
      <h1 className="mt-8 w-full md:mt-10">
        <img
          src={`${import.meta.env.BASE_URL}archivos/logo-skull-king.png`}
          alt="Skull King"
          draggable={false}
          className="mx-auto w-[84%] md:w-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
        />
      </h1>
      <p className="mb-6 mt-2 text-xs md:mb-9 font-semibold uppercase tracking-[0.25em] text-white">Anotador de puntos y manual</p>

      <div className="flex w-full flex-col gap-3 md:gap-4">
        <button type="button" onClick={partida.irANuevaPartida} className="btn-dorado w-full py-4 text-lg md:py-5">
          Nueva Partida
        </button>
        {partida.hayPartidaGuardada && (
          <button type="button" onClick={continuar} className="btn-oscuro latir w-full py-4 text-lg md:py-5">
            Continuar Partida{partida.partidasGuardadas.length > 1 ? ` (${partida.partidasGuardadas.length})` : ''}
          </button>
        )}
        <button type="button" onClick={() => setPantallaActual('jugadores')} className="btn-claro w-full py-4 text-lg md:py-5">
          Jugadores, Estadísticas e Historial
        </button>
        <button type="button" onClick={() => setPantallaActual('reglas')} className="btn-claro w-full py-4 text-lg md:py-5">
          Manual, Cartas y Reglas
        </button>
      </div>

      <div className="mt-4 flex w-full flex-col items-center gap-2 md:mt-6">
        {puedeInstalar && (
          <button type="button" onClick={() => void instalar()} className="btn-fantasma w-full py-3 text-sm">
            Instalar la app en este dispositivo
          </button>
        )}
        {mostrarAyudaIOS && (
          <p className="text-xs text-amber-100">Para instalarla en iPhone: tocá Compartir y elegí «Añadir a pantalla de inicio».</p>
        )}
      </div>

      <Modal abierto={eligiendo} onCerrar={() => setEligiendo(false)} ancho="max-w-md" etiqueta="Partidas en curso" cerrarAlHacerClickAfuera>
        <EncabezadoModal
          titulo="Partidas en curso"
          subtitulo={`${partida.partidasGuardadas.length} para continuar`}
          onCerrar={() => setEligiendo(false)}
        />
        <div className="scroll-oculto flex max-h-[75dvh] flex-col gap-3 overflow-y-auto p-4 text-left">
          {partida.partidasGuardadas.map((p) => {
            const ranking = [...p.jugadores].sort((a, b) => b.puntos - a.puntos);
            const totalRondas = p.cartasPorRondaActivas.length || 10;
            return (
              <article key={p.id} className="flex flex-col gap-2.5 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase text-amber-800">
                    Ronda {p.rondaActual} de {totalRondas} · {NOMBRE_MODO[p.configuracionMesa.modoContenido] ?? 'Juego Base'}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">{formatearFecha(p.actualizada)}</span>
                </header>

                <ul className="flex flex-col gap-1">
                  {ranking.map((jugador) => (
                    <li key={jugador.permanenteId || jugador.nombre} className="flex items-center justify-between gap-3 rounded-lg bg-white px-2.5 py-1.5 text-sm">
                      <span className="min-w-0 truncate font-bold text-tinta">{jugador.nombre}</span>
                      <strong className={`shrink-0 tabular-nums ${jugador.puntos < 0 ? 'text-rojo-osc' : 'text-tinta'}`}>{jugador.puntos}</strong>
                    </li>
                  ))}
                </ul>

                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEligiendo(false);
                      partida.continuarPartida(p.id);
                    }}
                    className="btn-dorado py-3 text-sm"
                  >
                    Continuar
                  </button>
                  <button type="button" onClick={() => setADescartar(p.id)} aria-label="Descartar esta partida" className="btn-peligro px-4 py-3 text-sm">
                    Descartar
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </Modal>

      <ModalConfirmacion
        abierto={aDescartar !== null}
        titulo="¿Descartar esta partida?"
        descripcion="Se pierde todo lo cargado y no queda en el historial ni en las estadísticas."
        textoConfirmar="Descartar"
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
