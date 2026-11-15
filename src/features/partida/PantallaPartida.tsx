import { useState } from 'react';
import { useApp } from '../../estado/AppProvider';
import { useWakeLock } from '../../ui/useWakeLock';
import { ModalAviso } from '../../ui/ModalAviso';
import { PasoApuestas } from './pasos/PasoApuestas';
import { PasoPuntos } from './pasos/PasoPuntos';
import { PasoResumen } from './pasos/PasoResumen';
import type { PasoPartida } from '../../tipos';

const PASOS: [PasoPartida, string][] = [
  ['apuestas', 'Envite'],
  ['puntos', 'Puntos'],
  ['resumen', 'Resumen'],
];

export function PantallaPartida() {
  const { partida, ajustes, setMenuHamburguesaAbierto, abrirPodio, setPantallaActual } = useApp();
  const {
    rondaActual,
    rondaVisible,
    totalRondas,
    cartasPorJugadorVisibles,
    pasoPartida,
    jugadores,
    indiceJugadorInicial,
    puedeModificarRondaAnterior,
    editandoRondaAnterior,
    puedeIrAPasoAnterior,
    irAPasoAnterior,
    iniciarModificacionRondaAnterior,
    cancelarModificacionRondaAnterior,
  } = partida;

  useWakeLock(ajustes.mantenerPantallaEncendida);
  const [avisoRonda, setAvisoRonda] = useState<number | null>(null);

  const jugadorInicial = jugadores[indiceJugadorInicial];
  const indiceReparte = indiceJugadorInicial > 0 ? indiceJugadorInicial - 1 : jugadores.length - 1;
  const jugadorReparte = jugadores[indiceReparte];

  const tocarRonda = (numero: number) => {
    if (numero === rondaVisible - 1 && puedeModificarRondaAnterior) {
      iniciarModificacionRondaAnterior();
      return;
    }
    if (numero < rondaVisible) setAvisoRonda(numero);
  };

  return (
    <main className="flex w-full flex-1 flex-col gap-4 py-4">
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => setPantallaActual('inicio')} className="btn-fantasma px-3 py-2 text-sm">
            ← Menú
          </button>
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-100">Partida en curso · se guarda sola</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuHamburguesaAbierto(true)}
              aria-label="Abrir menú de la partida"
              className="btn-fantasma h-11 w-11 p-0"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <span className="block text-xs font-bold uppercase tracking-widest text-amber-100">
                Ronda {rondaVisible} de {totalRondas}
              </span>
              <h2 className="font-display text-lg font-bold leading-tight text-white">
                {cartasPorJugadorVisibles} carta{cartasPorJugadorVisibles > 1 ? 's' : ''} en juego
              </h2>
            </div>
          </div>
          <button type="button" onClick={abrirPodio} aria-label="Ver tabla de puntajes" className="btn-claro px-3.5 py-2.5 text-xs">
            Tabla
          </button>
        </div>

        <div className="scroll-oculto -mx-1 flex gap-2 overflow-x-auto px-1 py-1" aria-label="Rondas">
          {Array.from({ length: totalRondas }, (_, i) => i + 1).map((numero) => {
            const esActual = numero === rondaVisible;
            const esPasada = numero < rondaVisible;
            return (
              <button
                key={numero}
                type="button"
                disabled={!esPasada}
                onClick={() => tocarRonda(numero)}
                aria-current={esActual ? 'step' : undefined}
                aria-label={esActual ? `Ronda ${numero}, en curso` : esPasada ? `Corregir ronda ${numero}` : `Ronda ${numero}`}
                className={`flex h-11 min-w-11 shrink-0 items-center justify-center rounded-full text-base font-bold ${
                  esActual
                    ? 'border-2 border-oro bg-oro text-tinta-oro'
                    : esPasada
                      ? 'border border-amber-200/60 bg-amber-200/30 text-amber-50'
                      : 'border border-white/15 bg-white/5 text-white/40'
                }`}
              >
                {numero}
              </button>
            );
          })}
        </div>

        {pasoPartida !== 'resumen' && jugadorInicial && jugadorReparte && (
          <div className="flex items-center justify-between gap-2 rounded-xl bg-white/10 px-3 py-1.5 text-[11px] text-amber-50">
            <span className="min-w-0 truncate">
              Arranca: <strong className="text-white">{jugadorInicial.nombre}</strong>
            </span>
            <span className="min-w-0 truncate">
              Reparte: <strong className="text-white">{jugadorReparte.nombre}</strong>
            </span>
          </div>
        )}

        <nav className="flex items-center gap-2" aria-label="Pasos de la ronda">
          {PASOS.map(([pasoId, etiqueta], i) => {
            const esActual = pasoPartida === pasoId;
            const puedeVolver = puedeIrAPasoAnterior(pasoId);
            return (
              <button
                key={pasoId}
                type="button"
                onClick={() => irAPasoAnterior(pasoId)}
                disabled={!puedeVolver}
                aria-current={esActual ? 'step' : undefined}
                className="flex flex-1 flex-col items-center gap-1 rounded-lg px-0.5 py-1 disabled:cursor-default"
              >
                <span className={`h-1.5 w-full rounded-full ${esActual ? 'bg-white' : puedeVolver ? 'bg-amber-200' : 'bg-white/20'}`} />
                <span className={`text-[10px] font-bold uppercase ${esActual ? 'text-white' : puedeVolver ? 'text-amber-100' : 'text-white/40'}`}>
                  {i + 1}. {etiqueta}
                </span>
              </button>
            );
          })}
        </nav>

        {editandoRondaAnterior && (
          <div className="flex items-center justify-between gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2">
            <span className="text-xs font-bold text-amber-900">✏️ Corrigiendo la ronda {rondaActual}</span>
            <button type="button" onClick={cancelarModificacionRondaAnterior} className="btn-claro px-2.5 py-1 text-[11px]">
              Cancelar corrección
            </button>
          </div>
        )}
      </header>

      {pasoPartida === 'apuestas' && <PasoApuestas />}
      {pasoPartida === 'puntos' && <PasoPuntos />}
      {pasoPartida === 'resumen' && <PasoResumen />}

      <ModalAviso
        abierto={avisoRonda !== null}
        titulo={`Ronda ${avisoRonda ?? ''}`}
        mensaje="Por ahora solo se puede corregir la ronda inmediatamente anterior a la que estás jugando."
        textoBoton="Entendido"
        onCerrar={() => setAvisoRonda(null)}
      />
    </main>
  );
}
