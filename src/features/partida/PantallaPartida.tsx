import { useApp } from '../../estado/AppProvider';
import { PasoApuestas } from './pasos/PasoApuestas';
import { PasoBazas } from './pasos/PasoBazas';
import { PasoBonos } from './pasos/PasoBonos';
import { PasoResumen } from './pasos/PasoResumen';
import type { PasoPartida } from '../../tipos';

const PASOS: [PasoPartida, string][] = [
  ['apuestas', '2. Envite'],
  ['bazas', '3. Bazas'],
  ['bonos', '4. Bonos'],
  ['resumen', '5. Resumen'],
];

const ORDEN_PASOS: PasoPartida[] = ['apuestas', 'bazas', 'bonos', 'resumen'];

export function PantallaPartida() {
  const { partida, setMenuHamburguesaAbierto, abrirPodio, setPantallaActual } = useApp();
  const {
    rondaActual,
    totalRondas,
    cartasPorJugadorEnRonda,
    pasoPartida,
    jugadores,
    indiceJugadorInicial,
    puedeModificarRondaAnterior,
    iniciarModificacionRondaAnterior,
  } = partida;

  const jugadorInicial = jugadores[indiceJugadorInicial];
  const indiceReparte = indiceJugadorInicial > 0
    ? indiceJugadorInicial - 1
    : jugadores.length - 1;
  const jugadorReparte = jugadores[indiceReparte];

  return (
    <main className="py-4 flex flex-col gap-4 w-full flex-1 overflow-hidden">
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPantallaActual('inicio')}
            className="text-sm text-amber-300 hover:text-white font-bold"
          >
            ← Menú
          </button>
          <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">
            Partida en curso
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuHamburguesaAbierto(true)}
              className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-amber-300 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div>
              <span className="text-xs uppercase tracking-widest text-amber-300 font-bold block">
                Ronda {rondaActual} / {totalRondas}
              </span>
              <h2 className="text-lg font-extrabold text-white leading-tight">
                {cartasPorJugadorEnRonda} carta{cartasPorJugadorEnRonda > 1 ? 's' : ''} en juego
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {puedeModificarRondaAnterior && (
              <button
                onClick={iniciarModificacionRondaAnterior}
                className="btn-secundario-retroceder"
                title="Modificar ronda inmediatamente anterior"
              >
                ↩ Modificar R{rondaActual - 1}
              </button>
            )}
            <button
              onClick={abrirPodio}
              className="text-xs bg-emerald-950/80 border border-emerald-600/70 text-emerald-200 px-3.5 py-2.5 rounded-xl font-bold shadow-sm hover:bg-emerald-900 transition-all"
            >
              🏆 Podio
            </button>
          </div>
        </div>

        {jugadorInicial && jugadorReparte && (
          <div className="flex items-center justify-between tarjeta-marron p-2.5 text-xs">
            <div className="text-amber-300 font-semibold">
              ⚓ Arranca: <strong className="text-white">{jugadorInicial.nombre}</strong>
            </div>
            <div className="text-slate-300">
              🃏 Reparte: <strong className="text-white">{jugadorReparte.nombre}</strong>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-1">
          {PASOS.map(([pasoId, etiqueta], idx) => {
            const pasoIndex = ORDEN_PASOS.indexOf(pasoPartida);
            const esActual = pasoPartida === pasoId;
            const esPasado = pasoIndex > idx;
            return (
              <div key={pasoId} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full h-1.5 rounded-full ${
                    esActual ? 'bg-amber-400' : esPasado ? 'bg-emerald-600' : 'bg-slate-800'
                  }`}
                />
                <span
                  className={`text-[8px] font-bold uppercase ${
                    esActual ? 'text-amber-300' : 'text-slate-500'
                  }`}
                >
                  {etiqueta}
                </span>
              </div>
            );
          })}
        </div>
      </header>

      {pasoPartida === 'apuestas' && <PasoApuestas />}
      {pasoPartida === 'bazas' && <PasoBazas />}
      {pasoPartida === 'bonos' && <PasoBonos />}
      {pasoPartida === 'resumen' && <PasoResumen />}
    </main>
  );
}
