import { useMemo } from 'react';
import { MODOS_REPARTO, obtenerCartasPorRondaDelModo } from '../../../datos/modosReparto';
import type { ConfiguracionMesa, ModoRepartoId } from '../../../tipos';

interface Props {
  configuracion: ConfiguracionMesa;
  onCambiarModo: (modo: ModoRepartoId) => void;
  onCambiarCartasPersonalizadas: (ronda: number, cantidad: number) => void;
}

export function SelectorModoReparto({
  configuracion,
  onCambiarModo,
  onCambiarCartasPersonalizadas,
}: Props) {
  const modoSeleccionado = MODOS_REPARTO.find((m) => m.id === configuracion.modoReparto);
  const vistaPrevia = useMemo(
    () => obtenerCartasPorRondaDelModo(configuracion.modoReparto, configuracion.cartasPorRonda),
    [configuracion.modoReparto, configuracion.cartasPorRonda]
  );

  return (
    <section className="tarjeta-marron p-4">
      <label className="block text-xs uppercase tracking-wider text-amber-300 font-bold mb-3">
        🃏 Modo de Reparto de Cartas
      </label>

      <select
        value={configuracion.modoReparto}
        onChange={(e) => onCambiarModo(e.target.value as ModoRepartoId)}
        className="w-full font-bold text-xs sm:text-sm"
      >
        {MODOS_REPARTO.map((modo) => (
          <option key={modo.id} value={modo.id}>
            {modo.icono} {modo.nombre} {modo.cartas ? `(${modo.cartas.join(', ')})` : '(A elección)'}
          </option>
        ))}
      </select>

      <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{modoSeleccionado?.descripcion}</p>

      <div className="mt-2 p-2.5 bg-slate-900/90 border border-amber-900/40 rounded-xl flex items-center justify-between text-xs">
        <span className="text-slate-300 font-semibold">Esta partida tendrá:</span>
        <span className="font-black text-amber-300">
          {vistaPrevia.length} ronda{vistaPrevia.length === 1 ? '' : 's'} ({vistaPrevia.join(', ')}{' '}
          carta{vistaPrevia.length === 1 && vistaPrevia[0] === 1 ? '' : 's'})
        </span>
      </div>

      {configuracion.modoReparto === 'personalizado' && (
        <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex flex-col gap-2.5 mt-3">
          <span className="text-[11px] text-slate-300 font-semibold block border-b border-slate-800 pb-1">
            Configurá cuántas cartas se repartirán en cada una de las 10 rondas:
          </span>
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((numeroRonda) => (
              <div key={numeroRonda} className="tarjeta-ronda-personalizada">
                <span className="linea-1">Ronda</span>
                <span className="linea-2">{numeroRonda}</span>
                <div className="linea-3">
                  <select
                    value={configuracion.cartasPorRonda[numeroRonda - 1] ?? numeroRonda}
                    onChange={(e) =>
                      onCambiarCartasPersonalizadas(numeroRonda - 1, Number(e.target.value))
                    }
                  >
                    {Array.from({ length: 10 }, (_, j) => j + 1).map((cantidad) => (
                      <option key={cantidad} value={cantidad}>
                        {cantidad}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
