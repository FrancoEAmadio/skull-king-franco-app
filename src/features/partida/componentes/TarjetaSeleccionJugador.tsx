import { calcularPosicionesFrecuentes } from '../../../dominio/estadisticas';
import type { FrecuenciaPosicion } from '../../../dominio/estadisticas';
import type { JugadorPermanente } from '../../../tipos';

interface Props {
  jugador: JugadorPermanente;
  posicionSeleccion: number | null;
  onSeleccionar: () => void;
}

const SUFIJOS_ORDINALES = new Map<number, string>([
  [1, 'st'],
  [2, 'nd'],
  [3, 'rd'],
]);

function formatearPosicion(posicion: number): string {
  const ultimosDosDigitos = posicion % 100;
  const sufijo = ultimosDosDigitos >= 11 && ultimosDosDigitos <= 13
    ? 'th'
    : SUFIJOS_ORDINALES.get(posicion % 10) ?? 'th';
  return `${posicion}${sufijo}`;
}

interface ResumenPosicionProps {
  frecuencia?: FrecuenciaPosicion;
  destacada?: boolean;
  seleccionado: boolean;
}

function ResumenPosicion({ frecuencia, destacada = false, seleccionado }: ResumenPosicionProps) {
  const colorPrincipal = seleccionado ? 'text-amber-950' : 'text-amber-300';
  const colorSecundario = seleccionado ? 'text-amber-900' : 'text-slate-400';

  if (!frecuencia) {
    return (
      <div className="flex min-h-10 flex-col items-center justify-center">
        <span className={`${destacada ? 'text-lg' : 'text-sm'} font-black ${colorSecundario}`}>—</span>
        <span className={`text-[8px] font-bold uppercase ${colorSecundario}`}>Sin registro</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-10 flex-col items-center justify-center">
      <span className={`${destacada ? 'text-3xl' : 'text-base'} font-black leading-none ${colorPrincipal}`}>
        {formatearPosicion(frecuencia.posicion)}
      </span>
      <span className={`mt-1 text-[9px] font-bold ${colorSecundario}`}>
        {frecuencia.cantidad} {frecuencia.cantidad === 1 ? 'vez' : 'veces'}
      </span>
    </div>
  );
}

export function TarjetaSeleccionJugador({ jugador, posicionSeleccion, onSeleccionar }: Props) {
  const posiciones = calcularPosicionesFrecuentes(jugador.evolucion);
  const seleccionado = posicionSeleccion !== null;

  return (
    <button
      type="button"
      onClick={onSeleccionar}
      aria-pressed={seleccionado}
      className={`w-full rounded-2xl border p-3 text-left transition-all ${
        seleccionado ? 'btn-blanco-marron' : 'btn-marron-oscuro'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {seleccionado && <span className="badge-orden-jugador shrink-0">{posicionSeleccion}</span>}
            <span className={`truncate text-base font-black ${seleccionado ? 'text-amber-950' : 'text-white'}`}>
              {jugador.nombre}
            </span>
          </div>
          <span className={`mt-1 block text-[9px] font-bold uppercase tracking-wide ${
            seleccionado ? 'text-amber-900' : 'text-slate-500'
          }`}>
            {seleccionado ? 'Seleccionado' : 'Tocá para seleccionar'}
          </span>
        </div>

        <div className={`w-[44%] max-w-36 shrink-0 border-l pl-3 ${seleccionado ? 'border-amber-700/50' : 'border-slate-700'}`}>
          <ResumenPosicion frecuencia={posiciones[0]} destacada seleccionado={seleccionado} />
          <div className={`mt-2 grid grid-cols-2 gap-1 border-t pt-2 ${
            seleccionado ? 'border-amber-700/40' : 'border-slate-700/70'
          }`}>
            <ResumenPosicion frecuencia={posiciones[1]} seleccionado={seleccionado} />
            <ResumenPosicion frecuencia={posiciones[2]} seleccionado={seleccionado} />
          </div>
        </div>
      </div>
    </button>
  );
}
