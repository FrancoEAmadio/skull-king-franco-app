import { useMemo, useState } from 'react';
import { MODOS_REPARTO, obtenerCartasPorRondaDelModo } from '../../../datos/modosReparto';
import type { ConfiguracionMesa, ModoRepartoId } from '../../../tipos';
import { TONOS_APP, type NombreTono } from '../../../ui/tonos';

const TONO_MODO: Record<ModoRepartoId, NombreTono> = {
  clasico: 'amarillo',
  sobre: 'azul',
  remolino: 'cian',
  directo_pelea: 'rojo',
  escaramuza: 'naranja',
  andanada: 'rosa',
  tarde: 'indigo',
  personalizado: 'pizarra',
};

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
    <section className="tarjeta flex flex-col gap-3 p-4">
      <h3 className="tarjeta-titulo">2. Modo de reparto</h3>

      <div className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={abierto}
          onClick={() => setAbierto(!abierto)}
          className={`flex min-h-12 w-full items-center justify-between rounded-xl border-2 px-4 text-left text-sm font-semibold ${TONOS_APP[TONO_MODO[configuracion.modoReparto]].activo}`}
        >
          <span>
            {modoSeleccionado?.icono} {modoSeleccionado?.nombre}
          </span>
          <span className="text-azul">{abierto ? '▲' : '▼'}</span>
        </button>

        {abierto && (
          <ul role="listbox" className="mt-2 flex max-h-72 flex-col gap-1 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-1.5">
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
                    className={`flex min-h-11 w-full items-center justify-between rounded-lg border-2 px-3 text-left text-sm font-semibold ${
                      activo ? TONOS_APP[TONO_MODO[modo.id]].activo : 'border-transparent text-tinta hover:bg-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 rounded-full ${TONOS_APP[TONO_MODO[modo.id]].punto}`} />
                      <span>
                        {modo.icono} {modo.nombre}
                      </span>
                    </span>
                    {activo && <span>✓</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-xs">
        <span className="font-semibold text-slate-500">Esta partida</span>
        <span className="text-right font-bold text-azul">
          {vistaPrevia.length} ronda{vistaPrevia.length === 1 ? '' : 's'} ({textoVistaPrevia(vistaPrevia)} carta
          {vistaPrevia.length === 1 && vistaPrevia[0] === 1 ? '' : 's'})
        </span>
      </div>

      {configuracion.modoReparto === 'personalizado' && (
        <button type="button" onClick={onConfigurarPersonalizado} className="btn-claro w-full py-3 text-sm">
          ⚙️ Configurar reparto
        </button>
      )}
    </section>
  );
}
