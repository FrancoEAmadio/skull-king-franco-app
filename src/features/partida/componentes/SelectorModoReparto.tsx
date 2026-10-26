import { useMemo, useState } from 'react';
import { MODOS_REPARTO, obtenerCartasPorRondaDelModo } from '../../../datos/modosReparto';
import type { ConfiguracionMesa, ModoRepartoId } from '../../../tipos';

interface Props {
  configuracion: ConfiguracionMesa;
  onCambiarModo: (modo: ModoRepartoId) => void;
  onConfigurarPersonalizado: () => void;
}

function textoVistaPrevia(vistaPrevia: number[]): string {
  if (vistaPrevia.length <= 8) return vistaPrevia.join(', ');
  const inicio = vistaPrevia.slice(0, 4).join(', ');
  const fin = vistaPrevia.slice(-2).join(', ');
  return `${inicio}, ..., ${fin}`;
}

export function SelectorModoReparto({
  configuracion,
  onCambiarModo,
  onConfigurarPersonalizado,
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const modoSeleccionado = MODOS_REPARTO.find((m) => m.id === configuracion.modoReparto);
  const vistaPrevia = useMemo(
    () => obtenerCartasPorRondaDelModo(configuracion.modoReparto, configuracion.cartasPorRonda),
    [configuracion.modoReparto, configuracion.cartasPorRonda]
  );

  return (
    <section className="tarjeta-marron p-4">
      <label className="block text-sm uppercase tracking-wider text-amber-300 font-bold mb-3">
        🃏 Modo de Reparto de Cartas
      </label>

      <div className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={abierto}
          onClick={() => setAbierto(!abierto)}
          className="opcion-activa flex min-h-14 w-full items-center justify-between rounded-2xl px-4 text-left text-lg font-extrabold"
        >
          <span>
            {modoSeleccionado?.icono} {modoSeleccionado?.nombre}
          </span>
          <span className="text-amber-300">{abierto ? '▲' : '▼'}</span>
        </button>

        {abierto && (
          <ul
            role="listbox"
            className="mt-2 flex max-h-72 flex-col gap-1.5 overflow-y-auto rounded-2xl border border-slate-700 bg-slate-950 p-2"
          >
            {MODOS_REPARTO.map((modo) => {
              const activo = modo.id === configuracion.modoReparto;
              return (
                <li key={modo.id} role="option" aria-selected={activo}>
                  <button
                    type="button"
                    onClick={() => {
                      onCambiarModo(modo.id);
                      setAbierto(false);
                    }}
                    className={`flex min-h-12 w-full items-center justify-between rounded-xl px-3 text-left text-base font-bold ${
                      activo ? 'bg-amber-500/20 text-amber-200' : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <span>
                      {modo.icono} {modo.nombre}
                    </span>
                    {activo && <span>✓</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className="text-sm text-slate-400 mt-2 leading-relaxed">{modoSeleccionado?.descripcion}</p>

      <div className="mt-2 p-2.5 bg-slate-900/90 border border-amber-900/40 rounded-xl flex items-center justify-between text-sm">
        <span className="text-slate-300 font-semibold">Esta partida tendrá:</span>
        <span className="font-black text-amber-300 text-right ml-3">
          {vistaPrevia.length} ronda{vistaPrevia.length === 1 ? '' : 's'} ({textoVistaPrevia(vistaPrevia)}{' '}
          carta{vistaPrevia.length === 1 && vistaPrevia[0] === 1 ? '' : 's'})
        </span>
      </div>

      {configuracion.modoReparto === 'personalizado' && (
        <button
          type="button"
          onClick={onConfigurarPersonalizado}
          className="w-full mt-3 py-3 btn-marron-oscuro rounded-2xl font-bold text-base border border-amber-700/50 hover:border-amber-500/50"
        >
          ⚙️ Configurar reparto
        </button>
      )}
    </section>
  );
}
