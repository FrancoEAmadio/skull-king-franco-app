import { useState } from 'react';
import { FichasNumero } from '../../../ui/FichasNumero';
import { CARTAS_POR_RONDA_DEFECTO } from '../../../constantes';

interface Props {
  cartasPorRondaInicial: number[];
  maxRondas: number;
  maxCartasPorRonda: number;
  onGuardar: (cartas: number[]) => void;
  onCancelar: () => void;
}

export function ConfiguradorRepartoPersonalizado({
  cartasPorRondaInicial,
  maxRondas,
  maxCartasPorRonda,
  onGuardar,
  onCancelar,
}: Props) {
  const rondasIniciales = Math.max(
    1,
    Math.min(
      cartasPorRondaInicial.length > 0 ? cartasPorRondaInicial.length : CARTAS_POR_RONDA_DEFECTO.length,
      maxRondas
    )
  );

  const [paso, setPaso] = useState<'rondas' | 'cartas'>('rondas');
  const [cantidadRondas, setCantidadRondas] = useState(rondasIniciales);
  const [cartasPorRonda, setCartasPorRonda] = useState<number[]>(() =>
    cartasPorRondaInicial.length > 0
      ? cartasPorRondaInicial.slice(0, rondasIniciales)
      : Array.from({ length: rondasIniciales }, (_, i) => Math.min(i + 1, maxCartasPorRonda))
  );

  const ajustarCantidadRondas = (nuevaCantidad: number) => {
    const clamped = Math.max(1, Math.min(nuevaCantidad, maxRondas));
    setCantidadRondas(clamped);
    setCartasPorRonda((previas) => {
      if (clamped < previas.length) return previas.slice(0, clamped);
      const nuevas = [...previas];
      while (nuevas.length < clamped) {
        nuevas.push(Math.min(nuevas.length + 1, maxCartasPorRonda));
      }
      return nuevas;
    });
  };

  const cambiarCartasRonda = (indice: number, cantidad: number) => {
    const clamped = Math.max(1, Math.min(cantidad, maxCartasPorRonda));
    setCartasPorRonda((previas) => previas.map((c, i) => (i === indice ? clamped : c)));
  };

  const avanzarACartas = () => {
    setCartasPorRonda((previas) => {
      if (previas.length === cantidadRondas) return previas;
      if (previas.length > cantidadRondas) return previas.slice(0, cantidadRondas);
      const nuevas = [...previas];
      while (nuevas.length < cantidadRondas) {
        nuevas.push(Math.min(nuevas.length + 1, maxCartasPorRonda));
      }
      return nuevas;
    });
    setPaso('cartas');
  };

  return (
    <section className="tarjeta flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h2 className="font-display text-lg font-black text-azul">Reparto personalizado</h2>
        <button type="button" onClick={onCancelar} className="min-h-11 px-2 text-sm font-bold text-azul-vivo">
          Cancelar
        </button>
      </div>

      {paso === 'rondas' ? (
        <div className="flex flex-col gap-4">
          <div>
            <span className="tarjeta-titulo block">Paso 1 de 2</span>
            <p className="mt-1 text-sm text-slate-600">¿Cuántas rondas tendrá la partida? (1 a {maxRondas})</p>
          </div>
          <FichasNumero etiqueta="Cantidad de rondas" min={1} max={maxRondas} valor={cantidadRondas} onElegir={ajustarCantidadRondas} />
          <button type="button" onClick={avanzarACartas} className="btn-dorado w-full py-3.5 text-base">
            Continuar ➔
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <span className="tarjeta-titulo block">Paso 2 de 2</span>
            <p className="mt-1 text-sm text-slate-600">Cartas por ronda:</p>
          </div>
          <div className="flex flex-col">
            {cartasPorRonda.map((cantidad, indice) => (
              <div key={indice} className="flex flex-col gap-2 border-b border-slate-100 py-3 last:border-b-0">
                <span className="text-sm font-bold text-tinta">Ronda {indice + 1}</span>
                <FichasNumero
                  etiqueta={`Cartas de la ronda ${indice + 1}`}
                  min={1}
                  max={maxCartasPorRonda}
                  valor={cantidad}
                  onElegir={(numero) => cambiarCartasRonda(indice, numero)}
                />
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <button type="button" onClick={() => onGuardar(cartasPorRonda)} className="btn-dorado w-full py-3.5 text-base">
              Guardar y volver
            </button>
            <button type="button" onClick={() => setPaso('rondas')} className="btn-claro w-full py-3 text-sm">
              Volver
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
