import { VERSION_APP } from './constantes';
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
    <div className="contenedor-app mx-auto flex min-h-dvh w-full max-w-md flex-col justify-between md:max-w-5xl md:px-6">
      {pantallaActual === 'inicio' && <PantallaInicio />}
      {pantallaActual === 'nueva_partida' && <PantallaNuevaPartida />}
      {pantallaActual === 'partida' && <PantallaPartida />}
      {pantallaActual === 'jugadores' && <PantallaJugadores />}
      {pantallaActual === 'reglas' && <PantallaReglas />}

      <footer className="pie-pagina mt-6 w-full pt-3 text-center text-xs font-medium text-amber-100/80">
        <span className="mb-1 block font-bold text-amber-100">Versión {VERSION_APP}</span>
        <span className="block">Desarrollado por Franco Ezequiel Amadio</span>
        <span className="block">Colaboración de Mateo Álvarez</span>
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
