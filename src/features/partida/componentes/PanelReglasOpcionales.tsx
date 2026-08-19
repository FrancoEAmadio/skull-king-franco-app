import { useState } from 'react';
import { Toggle } from '../../../ui/Toggle';
import type { ConfiguracionMesa, ReglasOpcionales } from '../../../tipos';

const OPCIONES_AVANZADAS: [keyof ReglasOpcionales, string][] = [
  ['kraken', 'Kraken'],
  ['ballenaBlanca', 'Ballena Blanca'],
  ['botin', 'Botín'],
];

const OPCIONES_EXPANSION: [keyof ReglasOpcionales, string][] = [
  ['primerOficialKong', 'Primer Oficial Kong'],
  ['pirataMaryThorne', 'Mary Thorne'],
  ['mono15', 'Mono Comodín (15)'],
  ['mantarrayaMoteada', 'Mantarraya Moteada'],
  ['davyJones', 'Davy Jones'],
  ['caminarPorLaTabla', 'Caminar por la Tabla'],
  ['ultimaDescarga', 'Última Descarga'],
  ['carta7', 'Carta 7 (−5 pts bonificación)'],
  ['carta8', 'Carta 8 (+5 pts bonificación)'],
  ['cartas0y14', 'Cartas 0–14'],
];

interface Props {
  configuracion: ConfiguracionMesa;
  onCambiar: (regla: keyof ReglasOpcionales, valor: boolean) => void;
}

export function PanelReglasOpcionales({ configuracion, onCambiar }: Props) {
  const [abierto, setAbierto] = useState(false);
  const deshabilitarAvanzadas = configuracion.modoContenido === 'base';
  const deshabilitarExpansion = configuracion.modoContenido !== 'expansion';

  return (
    <section className="tarjeta-marron p-4 flex flex-col gap-4">
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        className="w-full flex justify-between items-center text-left"
      >
        <div>
          <h3 className="text-base font-extrabold text-amber-300 uppercase tracking-wider">
            ⚙️ Reglas y Cartas Opcionales
          </h3>
          <p className="text-xs text-slate-300 mt-0.5 font-normal">
            Activá o desactivá los elementos en juego.
          </p>
        </div>
        <span className="text-amber-400 font-bold text-base px-2">{abierto ? '▲' : '▼'}</span>
      </button>

      {abierto && (
        <div className="flex flex-col gap-4 pt-2 border-t border-slate-800">
          <GrupoOpciones
            titulo="🟣 Reglas Avanzadas"
            color="text-purple-300"
            opciones={OPCIONES_AVANZADAS}
            configuracion={configuracion}
            deshabilitado={deshabilitarAvanzadas}
            onCambiar={onCambiar}
          />
          <GrupoOpciones
            titulo="🟠 Expansión"
            color="text-amber-300"
            opciones={OPCIONES_EXPANSION}
            configuracion={configuracion}
            deshabilitado={deshabilitarExpansion}
            onCambiar={onCambiar}
          />
        </div>
      )}
    </section>
  );
}

interface GrupoProps {
  titulo: string;
  color: string;
  opciones: [keyof ReglasOpcionales, string][];
  configuracion: ConfiguracionMesa;
  deshabilitado: boolean;
  onCambiar: (regla: keyof ReglasOpcionales, valor: boolean) => void;
}

function GrupoOpciones({ titulo, color, opciones, configuracion, deshabilitado, onCambiar }: GrupoProps) {
  const clasesContenedor = `flex flex-col gap-2.5 bg-slate-900/80 p-3 rounded-xl border border-slate-800 transition-all ${
    deshabilitado ? 'opacity-40 pointer-events-none select-none' : ''
  }`;

  return (
    <div className={clasesContenedor}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-1">
        <span className={`text-xs font-bold ${color} uppercase tracking-wider`}>{titulo}</span>
      </div>
      {opciones.map(([clave, etiqueta]) => (
        <label key={clave} className="flex items-center justify-between cursor-pointer py-1">
          <span className="font-semibold text-xs text-slate-200">{etiqueta}</span>
          <Toggle
            tamano="sm"
            checked={configuracion.reglasOpcionales[clave]}
            disabled={deshabilitado}
            onChange={(valor) => onCambiar(clave, valor)}
          />
        </label>
      ))}
    </div>
  );
}
