import { useState } from 'react';
import { Toggle } from '../../../ui/Toggle';
import { modoPermiteRegla } from '../../../dominio/disponibilidadContenido';
import type { ConfiguracionMesa, ReglasOpcionales } from '../../../tipos';

const OPCIONES_AVANZADAS: [keyof ReglasOpcionales, string][] = [
  ['kraken', 'Kraken (nadie gana la baza)'],
  ['botin', 'Botín (alianzas +20 pts)'],
];

const OPCIONES_EXPANSION: [keyof ReglasOpcionales, string][] = [
  ['primerOficialKong', 'Primer Oficial Kong'],
  ['davyJones', 'Davy Jones (monstruos destruidos)'],
  ['carta7', 'Carta 7 (−5 pts)'],
  ['carta8', 'Carta 8 (+5 pts)'],
];

interface Props {
  configuracion: ConfiguracionMesa;
  onCambiar: (regla: keyof ReglasOpcionales, valor: boolean) => void;
}

export function PanelReglasOpcionales({ configuracion, onCambiar }: Props) {
  const [abierto, setAbierto] = useState(false);

  return (
    <section className="tarjeta overflow-hidden">
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        aria-expanded={abierto}
        className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left"
      >
        <h3 className="tarjeta-titulo !font-sans">5. Reglas y cartas opcionales</h3>
        <span className="text-sm font-bold text-azul">{abierto ? '▲' : '▼'}</span>
      </button>

      {abierto && (
        <div className="flex flex-col gap-3 px-4 pb-4">
          <GrupoOpciones titulo="Reglas avanzadas" opciones={OPCIONES_AVANZADAS} configuracion={configuracion} onCambiar={onCambiar} />
          <GrupoOpciones titulo="Expansión" opciones={OPCIONES_EXPANSION} configuracion={configuracion} onCambiar={onCambiar} />
        </div>
      )}
    </section>
  );
}

interface GrupoProps {
  titulo: string;
  opciones: [keyof ReglasOpcionales, string][];
  configuracion: ConfiguracionMesa;
  onCambiar: (regla: keyof ReglasOpcionales, valor: boolean) => void;
}

function GrupoOpciones({ titulo, opciones, configuracion, onCambiar }: GrupoProps) {
  const grupoDeshabilitado = opciones.every(([regla]) => !modoPermiteRegla(configuracion.modoContenido, regla));

  return (
    <div className={`flex flex-col rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 ${grupoDeshabilitado ? 'opacity-50' : ''}`}>
      <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{titulo}</span>
      {opciones.map(([clave, etiqueta]) => {
        const deshabilitada = !modoPermiteRegla(configuracion.modoContenido, clave);
        return (
          <div key={clave} className="flex items-center justify-between gap-3 border-t border-slate-200 first:border-t-0">
            <span className="text-sm font-semibold text-tinta">{etiqueta}</span>
            <Toggle
              etiqueta={etiqueta}
              checked={configuracion.reglasOpcionales[clave]}
              disabled={deshabilitada}
              onChange={(valor) => onCambiar(clave, valor)}
            />
          </div>
        );
      })}
    </div>
  );
}
