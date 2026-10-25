import { useState } from 'react';
import { useApp } from '../../estado/AppProvider';
import { copiarLink } from '../../infra/compartir';

export function ModalMenuHamburguesa() {
  const { menuHamburguesaAbierto, setMenuHamburguesaAbierto, setPantallaActual, setAjustesAbiertos, partida } =
    useApp();
  const [copiado, setCopiado] = useState(false);

  if (!menuHamburguesaAbierto) return null;

  const cerrar = () => setMenuHamburguesaAbierto(false);

  const copiar = async () => {
    const ok = await copiarLink();
    setCopiado(ok);
    window.setTimeout(() => setCopiado(false), 2200);
  };

  const claseOpcion =
    'flex min-h-14 w-full items-center gap-3 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-left text-lg font-bold text-white hover:bg-slate-800';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-start bg-black/80 p-4" onClick={cerrar}>
      <div className="tarjeta-marron mt-12 flex w-full max-w-sm flex-col gap-4 p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-700 pb-3">
          <span className="text-xl font-black text-amber-300">Menú de la partida</span>
          <button
            type="button"
            onClick={cerrar}
            aria-label="Cerrar menú"
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-2xl font-bold text-slate-300"
          >
            ✕
          </button>
        </div>
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => {
              cerrar();
              setPantallaActual('inicio');
            }}
            className={claseOpcion}
          >
            🏠 Volver al inicio
          </button>
          <button type="button" onClick={() => void copiar()} className={claseOpcion}>
            {copiado ? '✅ ¡Link copiado!' : '🔗 Copiar link de la página'}
          </button>
          <button
            type="button"
            onClick={() => {
              cerrar();
              setAjustesAbiertos(true);
            }}
            className={claseOpcion}
          >
            💬 Tu opinión o reportar error
          </button>
          <button
            type="button"
            onClick={() => {
              cerrar();
              setAjustesAbiertos(true);
            }}
            className={claseOpcion}
          >
            ⚙️ Ajustes
          </button>
          <button
            type="button"
            onClick={() => {
              cerrar();
              partida.descartarPartidaActual();
            }}
            className="flex min-h-14 w-full items-center gap-3 rounded-xl border border-red-700 bg-red-950/80 px-4 py-3 text-left text-lg font-bold text-red-200 hover:bg-red-900"
          >
            🗑️ Descartar partida
          </button>
        </div>
      </div>
    </div>
  );
}
