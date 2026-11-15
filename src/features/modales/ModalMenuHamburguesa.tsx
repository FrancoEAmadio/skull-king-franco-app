import { useState } from 'react';
import { useApp } from '../../estado/AppProvider';
import { copiarLink } from '../../infra/compartir';
import { ModalFeedback } from '../ajustes/ModalFeedback';

export function ModalMenuHamburguesa() {
  const { menuHamburguesaAbierto, setMenuHamburguesaAbierto, setPantallaActual, setAjustesAbiertos, partida } =
    useApp();
  const [copiado, setCopiado] = useState(false);
  const [feedbackAbierto, setFeedbackAbierto] = useState(false);

  if (!menuHamburguesaAbierto && !feedbackAbierto) {
    return null;
  }

  const cerrar = () => setMenuHamburguesaAbierto(false);

  const copiar = async () => {
    const ok = await copiarLink();
    setCopiado(ok);
    window.setTimeout(() => setCopiado(false), 2200);
  };

  const claseOpcion = 'btn-claro !justify-start w-full gap-3 px-4 py-3.5 text-left text-sm';

  if (!menuHamburguesaAbierto) {
    return <ModalFeedback abierto={feedbackAbierto} onCerrar={() => setFeedbackAbierto(false)} />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-start bg-black/70 p-4 backdrop-blur-sm" onClick={cerrar}>
      <div className="tarjeta entrar mt-12 flex w-full max-w-sm flex-col gap-3 p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <span className="text-lg font-black text-azul">Menú de la partida</span>
          <button
            type="button"
            onClick={cerrar}
            aria-label="Cerrar menú"
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl font-bold text-slate-600"
          >
            ✕
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <button type="button" onClick={() => { cerrar(); setPantallaActual('inicio'); }} className={claseOpcion}>
            🏠 Volver al inicio
          </button>
          <button type="button" onClick={() => void copiar()} className={claseOpcion}>
            {copiado ? '✅ ¡Link copiado!' : '🔗 Copiar link de la página'}
          </button>
          <button type="button" onClick={() => { cerrar(); setFeedbackAbierto(true); }} className={claseOpcion}>
            💬 Tu opinión o reportar error
          </button>
          <button type="button" onClick={() => { cerrar(); setAjustesAbiertos(true); }} className={claseOpcion}>
            ⚙️ Ajustes
          </button>
          <button
            type="button"
            onClick={() => { cerrar(); partida.descartarPartidaActual(); }}
            className="btn-peligro !justify-start w-full gap-3 px-4 py-3.5 text-left text-sm"
          >
            🗑️ Descartar partida
          </button>
        </div>
      </div>
    </div>
  );
}
