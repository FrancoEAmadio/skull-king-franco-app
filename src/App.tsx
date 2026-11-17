import { useEffect } from 'react';
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
  const enInicio = pantallaActual === 'inicio';

  // En el inicio se bloquea el scroll de la página: solo se desplaza (dentro del contenedor fijo) si el contenido no entra en la pantalla.
  useEffect(() => {
    if (!enInicio) return;
    const { documentElement: html, body } = document;
    const anterior = [html.style.overflow, body.style.overflow];
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    return () => {
      html.style.overflow = anterior[0];
      body.style.overflow = anterior[1];
    };
  }, [enInicio]);

  return (
    <div className={enInicio ? 'fixed inset-0 overflow-y-auto overscroll-none' : undefined}>
    <div className={`contenedor-app mx-auto flex ${enInicio ? 'min-h-full' : 'min-h-dvh'} w-full max-w-md flex-col justify-between md:max-w-3xl`}>
      {pantallaActual === 'inicio' && <PantallaInicio />}
      {pantallaActual === 'nueva_partida' && <PantallaNuevaPartida />}
      {pantallaActual === 'partida' && <PantallaPartida />}
      {pantallaActual === 'jugadores' && <PantallaJugadores />}
      {pantallaActual === 'reglas' && <PantallaReglas />}

      <footer className="pie-pagina mt-6 w-full pt-3 text-center text-xs font-medium text-amber-100/80">
        <span className="mb-1 block font-semibold text-amber-100">Versión {VERSION_APP}</span>
        <span className="block">Desarrollado por Franco Ezequiel Amadio</span>
        <span className="block">Colaboración de Mateo Álvarez</span>
      </footer>

      <ModalPodio />
      <ModalHistorialJugador />
      <ModalEstadisticasJugador />
      <ModalMenuHamburguesa />
      <ModalAjustes />
    </div>
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
