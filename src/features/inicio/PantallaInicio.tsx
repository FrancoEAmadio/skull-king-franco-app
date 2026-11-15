import { useApp } from '../../estado/AppProvider';
import { SimboloPirata } from '../../ui/SimboloPirata';
import { useInstalarPWA } from '../../ui/useInstalarPWA';

export function PantallaInicio() {
  const { setPantallaActual, partida, setAjustesAbiertos } = useApp();
  const { puedeInstalar, instalar, mostrarAyudaIOS } = useInstalarPWA();

  return (
    <main className="entrar my-auto flex w-full flex-col items-center py-4 text-center">
      <div className="mb-3 flex items-center gap-3 text-oro-claro" aria-hidden="true">
        <SimboloPirata nombre="skull" tamano={28} />
        <SimboloPirata nombre="sables" tamano={28} />
        <SimboloPirata nombre="ancla" tamano={28} />
        <SimboloPirata nombre="corona" tamano={28} />
      </div>
      <img
        src="./archivos/iconos/tapa.png"
        alt="Manual de Skull King"
        className="h-auto max-h-[24dvh] w-auto max-w-full rounded-3xl border border-oro/40 object-contain shadow-2xl"
      />
      <h1 className="mt-3 font-display text-5xl font-black tracking-wide text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">Skull King</h1>
      <p className="mb-8 mt-2 text-xs font-bold uppercase tracking-[0.25em] text-blue-200">Anotador de puntos</p>

      <div className="flex w-full flex-col gap-3">
        <button type="button" onClick={partida.irANuevaPartida} className="btn-dorado w-full py-4 text-lg">
          🏴‍☠️ Nueva Partida
        </button>
        {partida.hayPartidaGuardada && (
          <button type="button" onClick={() => setPantallaActual('partida')} className="btn-primario latir w-full py-4 text-lg">
            ▶ Continuar Partida
          </button>
        )}
        <button type="button" onClick={() => setPantallaActual('jugadores')} className="btn-claro w-full py-4 text-lg">
          👥 Jugadores, Estadísticas e Historial
        </button>
        <button type="button" onClick={() => setPantallaActual('reglas')} className="btn-claro w-full py-4 text-lg">
          📖 Manual, Cartas y Reglas
        </button>
      </div>

      <div className="mt-6 flex w-full flex-col items-center gap-2">
        {puedeInstalar && (
          <button type="button" onClick={() => void instalar()} className="btn-fantasma w-full py-3 text-sm">
            📲 Instalar la app en este dispositivo
          </button>
        )}
        {mostrarAyudaIOS && (
          <p className="text-xs text-blue-200">📲 Para instalarla en iPhone: tocá Compartir y elegí «Añadir a pantalla de inicio».</p>
        )}
        <button
          type="button"
          onClick={() => setAjustesAbiertos(true)}
          className="min-h-11 px-3 py-2 text-xs font-bold text-blue-200 underline underline-offset-4"
        >
          ⚙️ Ajustes y copia de seguridad
        </button>
      </div>
    </main>
  );
}
