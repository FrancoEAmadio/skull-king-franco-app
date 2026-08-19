import { AppProvider, useApp } from './estado/AppProvider';
import { PantallaInicio } from './features/inicio/PantallaInicio';
import { PantallaNuevaPartida } from './features/partida/PantallaNuevaPartida';
import { PantallaPartida } from './features/partida/PantallaPartida';
import { PantallaJugadores } from './features/jugadores/PantallaJugadores';
import { PantallaReglas } from './features/wiki/PantallaReglas';
import { ModalPodio } from './features/modales/ModalPodio';
import { ModalHistorialJugador } from './features/modales/ModalHistorialJugador';
import { ModalEstadisticasJugador } from './features/modales/ModalEstadisticasJugador';
import { ModalMenuHamburguesa } from './features/modales/ModalMenuHamburguesa';

function ContenidoApp() {
  const { pantallaActual } = useApp();

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col justify-between p-4">
      {pantallaActual === 'inicio' && <PantallaInicio />}
      {pantallaActual === 'nueva_partida' && <PantallaNuevaPartida />}
      {pantallaActual === 'partida' && <PantallaPartida />}
      {pantallaActual === 'jugadores' && <PantallaJugadores />}
      {pantallaActual === 'reglas' && <PantallaReglas />}

      <footer className="mt-6 py-3 text-center border-t border-slate-800/80 w-full">
        <p className="text-[11px] text-slate-500 font-medium">
          Desarrollado por Franco Ezequiel Amadio © 2026
        </p>
      </footer>

      <ModalPodio />
      <ModalHistorialJugador />
      <ModalEstadisticasJugador />
      <ModalMenuHamburguesa />
    </div>
  );
}

export function App() {
  return (
    <AppProvider>
      <ContenidoApp />
    </AppProvider>
  );
}
