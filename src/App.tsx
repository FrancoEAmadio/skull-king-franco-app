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
import { ModalAjustes } from './features/ajustes/ModalAjustes';

function ContenidoApp() {
  const { pantallaActual } = useApp();

  return (
    <div className="contenedor-app max-w-md mx-auto min-h-dvh flex flex-col justify-between">
      {pantallaActual === 'inicio' && <PantallaInicio />}
      {pantallaActual === 'nueva_partida' && <PantallaNuevaPartida />}
      {pantallaActual === 'partida' && <PantallaPartida />}
      {pantallaActual === 'jugadores' && <PantallaJugadores />}
      {pantallaActual === 'reglas' && <PantallaReglas />}

      <footer className="pie-pagina mt-6 w-full border-t border-slate-700 pt-3 text-center">
        <p className="text-base font-semibold text-slate-300">Desarrollado por Franco Ezequiel Amadio</p>
      </footer>

      <ModalPodio />
      <ModalHistorialJugador />
      <ModalEstadisticasJugador />
      <ModalMenuHamburguesa />
      <ModalAjustes />
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
