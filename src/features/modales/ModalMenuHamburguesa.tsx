import { useApp } from '../../estado/AppProvider';

export function ModalMenuHamburguesa() {
  const { menuHamburguesaAbierto, setMenuHamburguesaAbierto, setPantallaActual, partida } =
    useApp();

  if (!menuHamburguesaAbierto) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-start justify-start p-4 z-50"
      onClick={() => setMenuHamburguesaAbierto(false)}
    >
      <div
        className="tarjeta-marron p-5 w-64 flex flex-col gap-4 mt-12"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <span className="text-sm font-bold text-amber-300">Menú de Partida</span>
          <button
            onClick={() => setMenuHamburguesaAbierto(false)}
            className="text-slate-400 hover:text-white font-bold"
          >
            ✕
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              setMenuHamburguesaAbierto(false);
              setPantallaActual('inicio');
            }}
            className="text-left py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white border border-slate-800"
          >
            🏠 Volver al Inicio
          </button>
          <button
            onClick={() => {
              setMenuHamburguesaAbierto(false);
              partida.descartarPartidaActual();
            }}
            className="text-left py-2.5 px-3 rounded-xl bg-red-950/80 hover:bg-red-900 text-xs font-bold text-red-200 border border-red-800"
          >
            🗑️ Descartar Partida
          </button>
        </div>
      </div>
    </div>
  );
}
