import { useApp } from '../../../estado/AppProvider';
import { ChipCompacto, type TonoChip } from '../../../ui/ChipCompacto';
import { Seccion } from '../../../ui/Seccion';
import type { EventoBono } from '../../../tipos';

interface Props {
  numero?: number;
  eventosBase: EventoBono[];
  eventosExpansion: EventoBono[];
  /** Sin bazas ganadas no hay capturas: solo queda Davy Jones (no gana bazas). */
  sinBazas?: boolean;
}

const PALOS: { id: string; titulo: string; tono: TonoChip; aclaracion: string }[] = [
  { id: 'siete_expansion', titulo: '−5', tono: 'rojo', aclaracion: 'capturó un 7' },
  { id: 'ocho_expansion', titulo: '+5', tono: 'verde', aclaracion: 'capturó un 8' },
  { id: 'catorce_color', titulo: '+10', tono: 'amarillo', aclaracion: 'capturó un 14' },
  { id: 'catorce_negro', titulo: '+20', tono: 'negro', aclaracion: 'capturó el 14 negro' },
];

const ESPECIALES: Record<string, { titulo: string; tono: TonoChip }> = {
  pirata_por_sk: { titulo: 'Pirata capturado por SK', tono: 'naranja' },
  sk_por_sirena: { titulo: 'SK capturado por Sirena', tono: 'agua' },
  sirena_por_pirata: { titulo: 'Sirena capturada por Pirata', tono: 'rojo' },
  kong_por_sk_sirena: { titulo: 'Kong capturado por SK o Sirena', tono: 'negro' },
  monstruo_davy: { titulo: 'Monstruo destruido por Davy Jones', tono: 'verde' },
};

export function PanelEventosBono({ numero, eventosBase: baseTodos, eventosExpansion: expTodos, sinBazas = false }: Props) {
  const { partida } = useApp();
  const {
    jugadorActual,
    obtenerCantidadBono,
    obtenerMaximoBono,
    cambiarCantidadBono,
    limpiarTodosLosEventos,
    motivoTopeBono,
    borrarBonoInmediato,
  } = partida;

  if (!jugadorActual) return null;
  const eventosBase = sinBazas ? [] : baseTodos;
  const eventosExpansion = sinBazas ? expTodos.filter((e) => e.id === 'monstruo_davy') : expTodos;

  const tieneEventos = Object.values(jugadorActual.eventosBono).some((v) => Number(v) !== 0);
  const disponibles = new Set([...eventosBase, ...eventosExpansion].map((e) => e.id));
  const palos = PALOS.filter((p) => disponibles.has(p.id));
  const especialesBase = eventosBase.filter((e) => ESPECIALES[e.id]);
  const especialesExp = eventosExpansion.filter((e) => ESPECIALES[e.id]);

  const chip = (evento: { id: string; puntos: number }, titulo: string, tono?: TonoChip, grande?: boolean, aclaracion?: string) => (
    <ChipCompacto
      key={evento.id}
      titulo={titulo}
      aclaracion={aclaracion}
      subtitulo={grande ? undefined : `${evento.puntos > 0 ? '+' : ''}${evento.puntos} pts`}
      tono={tono}
      grande={grande}
      cantidad={obtenerCantidadBono(evento.id)}
      maximo={obtenerMaximoBono(evento.id)}
      onMas={() => cambiarCantidadBono(evento.id, 1)}
      onBorrar={() => borrarBonoInmediato(evento.id)}
    />
  );

  const motivos = [...especialesBase, ...especialesExp, ...palos.map((p) => ({ id: p.id }))]
    .filter((e) => obtenerMaximoBono(e.id) <= 0 && obtenerCantidadBono(e.id) === 0)
    .map((e) => motivoTopeBono(e.id))
    .filter((m, i, arr) => m && arr.indexOf(m) === i);

  return (
    <Seccion numero={numero} titulo="Bonos de la ronda">
      {sinBazas && <p className="text-sm text-slate-600">Sin bazas ganadas no hay capturas{eventosExpansion.length > 0 ? ', salvo los monstruos que destruyó Davy Jones' : ''}.</p>}
      {!sinBazas && <div className="flex flex-col gap-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Cartas de palo capturadas</span>
        <div className="grid grid-cols-2 gap-2">
          {palos.map((p) => chip({ id: p.id, puntos: 0 }, p.titulo, p.tono, true, p.aclaracion))}
        </div>
      </div>}

      {especialesBase.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Capturas especiales</span>
          <div className="grid grid-cols-3 gap-2">
            {especialesBase.map((e) => chip(e, ESPECIALES[e.id]!.titulo, ESPECIALES[e.id]!.tono))}
          </div>
        </div>
      )}

      {especialesExp.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Expansión</span>
          <div className="grid grid-cols-2 gap-2">
            {especialesExp.map((e) => chip(e, ESPECIALES[e.id]!.titulo, ESPECIALES[e.id]!.tono))}
          </div>
        </div>
      )}

      {motivos.length > 0 && (
        <ul className="flex flex-col gap-0.5">
          {motivos.map((m) => (
            <li key={m} className="text-xs font-semibold text-amber-700">{m}</li>
          ))}
        </ul>
      )}

      {tieneEventos && (
        <button type="button" onClick={limpiarTodosLosEventos} className="btn-claro mx-auto px-5 py-2.5 text-sm">
          Limpiar bonos
        </button>
      )}
    </Seccion>
  );
}
