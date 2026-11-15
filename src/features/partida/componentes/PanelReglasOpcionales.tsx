import { useState } from 'react';
import { modoPermiteRegla } from '../../../dominio/disponibilidadContenido';
import { vibrar } from '../../../infra/vibracion';
import type { ConfiguracionMesa, ReglasOpcionales } from '../../../tipos';

type Opcion = [keyof ReglasOpcionales, string, string];

const OPCIONES_AVANZADAS: Opcion[] = [
  ['kraken', 'Kraken', 'Nadie gana la baza'],
  ['botin', 'Botín', 'Alianzas +20 pts'],
];

const OPCIONES_EXPANSION: Opcion[] = [
  ['primerOficialKong', 'Primer Oficial Kong', 'Copia una habilidad'],
  ['davyJones', 'Davy Jones', 'Monstruos destruidos'],
  ['carta7', 'Carta 7', '−5 pts al capturarla'],
  ['carta8', 'Carta 8', '+5 pts al capturarla'],
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
        <h3 className="tarjeta-titulo">5. Reglas y cartas opcionales</h3>
        <span className="text-sm font-semibold text-azul">{abierto ? '▲' : '▼'}</span>
      </button>
      {abierto && (
        <div className="flex flex-col gap-4 px-4 pb-4">
          <Grupo titulo="Reglas avanzadas" opciones={OPCIONES_AVANZADAS} configuracion={configuracion} onCambiar={onCambiar} />
          <Grupo titulo="Expansión" opciones={OPCIONES_EXPANSION} configuracion={configuracion} onCambiar={onCambiar} />
        </div>
      )}
    </section>
  );
}

interface GrupoProps {
  titulo: string;
  opciones: Opcion[];
  configuracion: ConfiguracionMesa;
  onCambiar: (regla: keyof ReglasOpcionales, valor: boolean) => void;
}

function Grupo({ titulo, opciones, configuracion, onCambiar }: GrupoProps) {
  const sinModo = opciones.every(([regla]) => !modoPermiteRegla(configuracion.modoContenido, regla));
  return (
    <div className={`flex flex-col gap-2 ${sinModo ? 'opacity-45' : ''}`}>
      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
        {titulo}
        {sinModo && ' · no disponible en este modo'}
      </span>
      <div className="grid grid-cols-2 gap-2.5">
        {opciones.map(([clave, nombre, detalle]) => {
          const deshabilitada = !modoPermiteRegla(configuracion.modoContenido, clave);
          const activo = configuracion.reglasOpcionales[clave];
          return (
            <button
              key={clave}
              type="button"
              role="switch"
              aria-checked={activo}
              disabled={deshabilitada}
              onClick={() => {
                vibrar();
                onCambiar(clave, !activo);
              }}
              className={`flex min-h-[5rem] flex-col items-start justify-between gap-1 p-3 text-left disabled:cursor-not-allowed disabled:opacity-50 ${
                activo ? 'opcion opcion-sel' : 'opcion'
              }`}
            >
              <span className="text-sm font-bold leading-tight">{nombre}</span>
              <span className="text-xs font-semibold leading-tight text-slate-500">{detalle}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
