import { useMemo } from 'react';
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

      <select
        value={configuracion.modoReparto}
        onChange={(e) => onCambiarModo(e.target.value as ModoRepartoId)}
        className="w-full font-bold text-sm sm:text-base"
      >
        {MODOS_REPARTO.map((modo) => (
          <option key={modo.id} value={modo.id}>
            {modo.icono} {modo.nombre}
          </option>
        ))}
      </select>

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
