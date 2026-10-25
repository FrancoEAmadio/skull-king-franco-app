import { useApp } from '../../estado/AppProvider';
import { useInstalarPWA } from '../../ui/useInstalarPWA';

export function PantallaInicio() {
  const { setPantallaActual, partida, setAjustesAbiertos } = useApp();
  const { puedeInstalar, instalar, mostrarAyudaIOS } = useInstalarPWA();

  return (
    <main className="my-auto flex w-full flex-col items-center py-4 text-center">
      <img
        src="./archivos/iconos/tapa.png"
        alt="Skull King"
        className="mb-3 h-auto max-h-[24dvh] w-auto max-w-full rounded-3xl border border-amber-500/40 object-contain shadow-2xl drop-shadow-[0_10px_18px_rgba(245,158,11,0.3)]"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />

      <h1 className="titulo-pirata mb-1 text-6xl text-white">Skull King</h1>
      <p className="mb-5 text-base font-bold uppercase tracking-[0.25em] text-amber-300">Anotador de puntos</p>

      <div className="flex w-full flex-col gap-3">
        <button
          type="button"
          onClick={partida.irANuevaPartida}
          className="btn-blanco-marron w-full rounded-2xl py-5 text-2xl shadow-lg"
        >
          🏴‍☠️ Nueva Partida
        </button>
        {partida.hayPartidaGuardada && (
          <button
            type="button"
            onClick={() => setPantallaActual('partida')}
            className="btn-marron-oscuro w-full rounded-2xl border-amber-400/60 py-5 text-2xl text-amber-300"
          >
            ▶️ Continuar Partida
          </button>
        )}
        <button
          type="button"
          onClick={() => setPantallaActual('jugadores')}
          className="btn-marron-oscuro w-full rounded-2xl py-5 text-xl"
        >
          👥 Jugadores, Estadísticas e Historial
        </button>
        <button
          type="button"
          onClick={() => setPantallaActual('reglas')}
          className="btn-marron-oscuro w-full rounded-2xl py-5 text-xl"
        >
          📖 Manual, Cartas y Reglas
        </button>
      </div>

      <div className="mt-6 flex w-full flex-col items-center gap-2">
        {puedeInstalar && (
          <button
            type="button"
            onClick={() => void instalar()}
            className="btn-marron-oscuro w-full rounded-2xl py-4 text-lg"
          >
            📲 Instalar la app en este dispositivo
          </button>
        )}
        {mostrarAyudaIOS && (
          <p className="text-base text-slate-300">
            📲 Para instalarla en iPhone: tocá Compartir y elegí «Añadir a pantalla de inicio».
          </p>
        )}
        <button
          type="button"
          onClick={() => setAjustesAbiertos(true)}
          className="px-3 py-3 text-base font-bold text-slate-300 underline underline-offset-4"
        >
          ⚙️ Ajustes
        </button>
      </div>
    </main>
  );
}
