import type { ReactNode } from 'react';
import { useApp } from '../../../estado/AppProvider';

const signo = (n: number) => `${n > 0 ? '+' : ''}${n}`;

interface Linea {
  etiqueta: string;
  valor: string;
  tachada?: boolean;
}

function Grupo({ titulo, lineas, subtotal }: { titulo: string; lineas: Linea[]; subtotal?: number }): ReactNode {
  if (lineas.length === 0) return null;
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between pb-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-azul">{titulo}</span>
        {subtotal !== undefined && (
          <span className={`text-sm font-bold ${subtotal < 0 ? 'text-rojo-osc' : 'text-azul'}`}>{signo(subtotal)}</span>
        )}
      </div>
      {lineas.map((linea, i) => (
        <div key={`${linea.etiqueta}-${i}`} className="fila-puntaje py-1.5 text-sm text-slate-700">
          <span className={`fila-puntaje-nombre ${linea.tachada ? 'tachado-rojo text-slate-400' : ''}`}>{linea.etiqueta}</span>
          <span className={`fila-puntaje-valor ${linea.tachada ? 'tachado-rojo text-slate-400' : ''}`}>{linea.valor}</span>
        </div>
      ))}
    </div>
  );
}

export function PasoResumen() {
  const { partida, abrirPodio } = useApp();
  const {
    resumenRondaActual,
    partidaFinalizada,
    partidaPendienteFinalizar,
    rondaVisible,
    irASiguienteRonda,
    confirmarFinalizacionPartida,
    irAPasoAnterior,
  } = partida;

  const confirmarResultadoFinal = () => {
    confirmarFinalizacionPartida();
    abrirPodio();
  };

  return (
    <section className="entrar flex flex-1 flex-col gap-4">
      <div className="tarjeta pergamino p-4">
        <span className="tarjeta-titulo block">Resumen de la ronda {rondaVisible}</span>
        {(partidaFinalizada || partidaPendienteFinalizar) && (
          <span className="mt-1 block text-xs text-slate-500">
            {partidaFinalizada ? 'Partida finalizada.' : 'Revisá el resultado antes de confirmar la partida.'}
          </span>
        )}
      </div>

      {resumenRondaActual.map((res) => {
        const cobradas = res.bonosCobradas ?? [];
        const esHabilidad = (etiqueta: string) => /\((Acertada|Fallada)\)/.test(etiqueta);
        const habilidades = cobradas.filter((b) => esHabilidad(b.etiqueta));
        const otras = cobradas.filter((b) => !esHabilidad(b.etiqueta));
        const bonos = otras.filter((b) => b.subtotal >= 0);
        const penal = otras.filter((b) => b.subtotal < 0);
        const registradas = (res.habilidadesRegistradas ?? []).filter((h) => !/Bribón/.test(h.etiqueta));
        const suma = (lista: typeof cobradas) => lista.reduce((acc, b) => acc + b.subtotal, 0);
        const fmt = (b: (typeof cobradas)[number]) => ({
          etiqueta: `${b.etiqueta}${b.cantidad > 1 ? ` ×${b.cantidad}` : ''}`,
          valor: signo(b.subtotal),
        });
        const lineasHab: Linea[] = [
          ...habilidades.map(fmt),
          ...registradas.map((h) => ({ etiqueta: h.etiqueta, valor: 'Envite' })),
        ];

        return (
          <article key={res.nombre} className="tarjeta pergamino flex flex-col gap-3 p-4">
            <header className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <h3 className="min-w-0 flex-1 truncate text-lg font-bold text-azul">{res.nombre}</h3>
              <span
                className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                  res.acierto ? 'sello-ok' : 'sello-mal'
                }`}
              >
                {res.apuesta === '-' ? `${res.ganadas} baza${res.ganadas === 1 ? '' : 's'}` : `${res.acierto ? '✓ Acertó' : '✕ No acertó'} (${res.ganadas} de ${res.apuesta})`}
              </span>
            </header>

            <Grupo titulo="Base" lineas={[{ etiqueta: 'Puntaje base', valor: signo(res.puntajeBase) }]} />
            <Grupo titulo="Bonos" lineas={bonos.map(fmt)} subtotal={suma(bonos)} />
            <Grupo titulo="Habilidades" lineas={lineasHab} subtotal={suma(habilidades)} />
            <Grupo titulo="Penalizaciones" lineas={penal.map(fmt)} subtotal={suma(penal)} />
            <Grupo
              titulo="No cobrados por fallar"
              lineas={(res.bonosNoCobradas ?? []).map((b) => ({
                etiqueta: `${b.etiqueta}${b.cantidad > 1 ? ` ×${b.cantidad}` : ''}`,
                valor: signo(b.subtotal),
                tachada: true,
              }))}
            />

            <div className="fila-puntaje !items-end border-t border-slate-200 pt-3">
              <div className="fila-puntaje-valor !text-left">
                <span className="block text-[10px] font-semibold uppercase text-slate-400">Puntaje de la ronda</span>
                <span className={`text-2xl font-bold ${res.totalRonda < 0 ? 'text-rojo-osc' : 'text-azul'}`}>{signo(res.totalRonda)}</span>
              </div>
              <div className="min-w-0 flex-1 text-right">
                <span className="block text-[10px] font-semibold uppercase text-slate-400">Nuevo acumulado</span>
                <span className="whitespace-nowrap text-3xl font-bold text-tinta">{res.acumuladoNuevo}</span>
              </div>
            </div>
          </article>
        );
      })}

      <div className="barra-inferior mt-auto grid gap-2">
        {partidaFinalizada ? (
          <button type="button" onClick={abrirPodio} className="btn-dorado w-full py-4 text-base">
            Ver resultado final
          </button>
        ) : partidaPendienteFinalizar ? (
          <button type="button" onClick={confirmarResultadoFinal} className="btn-dorado w-full py-4 text-base">
            Confirmar resultado final
          </button>
        ) : (
          <button type="button" onClick={irASiguienteRonda} className="btn-dorado w-full py-4 text-base">
            Confirmar ronda y seguir ➔
          </button>
        )}
        {!partidaFinalizada && (
          <button type="button" onClick={() => irAPasoAnterior('puntos')} className="btn-fantasma w-full py-3 text-sm">
            ← Corregir puntos
          </button>
        )}
      </div>
    </section>
  );
}
