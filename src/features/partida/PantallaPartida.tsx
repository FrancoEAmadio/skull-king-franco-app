import { useState } from 'react';
import { useApp } from '../../estado/AppProvider';
import { useWakeLock } from '../../ui/useWakeLock';
import { ModalAviso } from '../../ui/ModalAviso';
import { PasoApuestas } from './pasos/PasoApuestas';
import { PasoBazas } from './pasos/PasoBazas';
import { PasoBonos } from './pasos/PasoBonos';
import { PasoResumen } from './pasos/PasoResumen';
import type { PasoPartida } from '../../tipos';

const PASOS: [PasoPartida, string][] = [
  ['apuestas', 'Envite'],
  ['bazas', 'Bazas'],
  ['bonos', 'Bonos'],
  ['resumen', 'Resumen'],
];

export function PantallaPartida() {
  const { partida, ajustes, setMenuHamburguesaAbierto, abrirPodio } = useApp();
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
    <main className="flex w-full flex-1 flex-col gap-3 py-3">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMenuHamburguesaAbierto(true)}
            aria-label="Abrir menú de la partida"
            className="btn-marron-oscuro flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-amber-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="min-w-0 flex-1 text-center">
            <h2 className="titulo-pirata whitespace-nowrap text-2xl leading-none text-amber-300">
              Ronda {rondaVisible} <span className="text-slate-300">de {totalRondas}</span>
            </h2>
            <span className="text-base font-bold text-white">
              {cartasPorJugadorVisibles} carta{cartasPorJugadorVisibles > 1 ? 's' : ''} en juego
            </span>
          </div>
          <button
            type="button"
            onClick={abrirPodio}
            aria-label="Ver podio y puntajes"
            className="flex h-12 shrink-0 items-center gap-1.5 rounded-xl border border-emerald-500/60 bg-emerald-950/80 px-3 text-base font-bold text-emerald-200"
          >
            🏆 Podio
          </button>
        </div>

        {/* Rondas: tocá la anterior para corregirla */}
        <div className="scroll-oculto -mx-1 flex gap-2 overflow-x-auto px-1 py-1" aria-label="Rondas">
          {Array.from({ length: totalRondas }, (_, i) => i + 1).map((numero) => {
            const esActual = numero === rondaVisible;
            const esPasada = numero < rondaVisible;
            const esCorregible = numero === rondaVisible - 1 && puedeModificarRondaAnterior;
            return (
              <button
                key={numero}
                type="button"
                disabled={!esPasada}
                onClick={() => tocarRonda(numero)}
                aria-current={esActual ? 'step' : undefined}
                aria-label={
                  esActual ? `Ronda ${numero}, en curso` : esPasada ? `Corregir ronda ${numero}` : `Ronda ${numero}`
                }
                className={`flex h-12 min-w-12 shrink-0 items-center justify-center rounded-full text-xl font-black ${
                  esActual
                    ? 'ficha-elegida !h-12 !w-12 !text-xl'
                    : esCorregible
                      ? 'border-2 border-amber-300 bg-amber-950/60 text-amber-200'
                      : esPasada
                        ? 'border border-emerald-600/70 bg-emerald-950/60 text-emerald-300'
                        : 'border border-slate-700 bg-slate-900/60 text-slate-500'
                }`}
              >
                {numero}
              </button>
            );
          })}
        </div>

        {pasoPartida !== 'resumen' && jugadorInicial && jugadorReparte && (
          <div className="tarjeta-marron flex items-center justify-between gap-2 px-4 py-3 text-base">
            <div className="font-semibold text-amber-300">
              ⚓ Arranca <strong className="text-white">{jugadorInicial.nombre}</strong>
            </div>
            <div className="font-semibold text-slate-300">
              🃏 Reparte <strong className="text-white">{jugadorReparte.nombre}</strong>
            </div>
          </div>
        )}

        <div className="flex items-stretch gap-2">
          {PASOS.map(([pasoId, etiqueta]) => {
            const esActual = pasoPartida === pasoId;
            const puedeVolver = puedeIrAPasoAnterior(pasoId);
            return (
              <button
                key={pasoId}
                type="button"
                onClick={() => irAPasoAnterior(pasoId)}
                disabled={!puedeVolver}
                className="flex flex-1 flex-col items-center gap-1.5 rounded-lg py-1"
              >
                <span
                  className={`h-2 w-full rounded-full ${
                    esActual ? 'bg-amber-400' : puedeVolver ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                />
                <span
                  className={`text-base font-bold ${
                    esActual ? 'text-amber-300' : puedeVolver ? 'text-emerald-300' : 'text-slate-400'
                  }`}
                >
                  {etiqueta}
                </span>
              </button>
            );
          })}
        </div>

        {editandoRondaAnterior && (
          <div className="flex items-center justify-between gap-2 rounded-xl border border-amber-500/70 bg-amber-950/50 px-4 py-3">
            <span className="text-base font-bold text-amber-200">Corrigiendo la ronda {rondaActual}</span>
            <button
              type="button"
              onClick={cancelarModificacionRondaAnterior}
              className="btn-marron-oscuro rounded-lg px-3 py-2 text-base font-bold"
            >
              Cancelar
            </button>
          </div>
        )}
      </header>

      {pasoPartida === 'apuestas' && <PasoApuestas />}
      {pasoPartida === 'bazas' && <PasoBazas />}
      {pasoPartida === 'bonos' && <PasoBonos />}
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
