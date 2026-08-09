import { useApp } from '../../estado/AppProvider';

export function PantallaInicio() {
  const { setPantallaActual, partida } = useApp();

  return (
    <main className="flex flex-col items-center justify-center my-auto text-center py-4 w-full">
      <img
        src="./archivos/iconos/tapa.png"
        alt="Skull King Portada"
        className="w-full max-w-xs h-auto mb-4 rounded-2xl shadow-2xl border border-amber-500/30 object-contain drop-shadow-[0_10px_15px_rgba(245,158,11,0.25)]"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />

      <h1 className="text-4xl font-extrabold tracking-wider text-white drop-shadow-md mb-1">
        Skull King
      </h1>
      <p className="text-xs uppercase tracking-widest text-amber-300 font-bold mb-6">
        Contador de Puntos y Manual
      </p>

      <div className="w-full flex flex-col gap-3">
        <button
          onClick={partida.irANuevaPartida}
          className="w-full py-4 btn-blanco-marron text-lg rounded-2xl font-bold shadow-lg"
        >
          🏴‍☠️ Nueva Partida
        </button>
        {partida.hayPartidaGuardada && (
          <button
            onClick={() => setPantallaActual('partida')}
            className="w-full py-4 btn-marron-oscuro text-lg rounded-2xl font-bold text-amber-300 border border-amber-500/40"
          >
            ▶️ Continuar Partida
          </button>
        )}
        <button
          onClick={() => setPantallaActual('jugadores')}
          className="w-full py-4 btn-marron-oscuro text-lg rounded-2xl font-semibold"
        >
          👥 Jugadores, Estadísticas e Historial
        </button>
        <button
          onClick={() => setPantallaActual('reglas')}
          className="w-full py-4 btn-marron-oscuro text-lg rounded-2xl font-semibold"
        >
          📖 Manual, Cartas y Reglas
        </button>
      </div>
    </main>
  );
}
