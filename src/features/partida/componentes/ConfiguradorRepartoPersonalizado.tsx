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
    <section className="tarjeta-marron p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h2 className="text-xl font-bold text-white">Reparto personalizado</h2>
        <button
          type="button"
          onClick={onCancelar}
          className="text-sm font-bold text-amber-300 hover:text-white"
        >
          Cancelar
        </button>
      </div>

      {paso === 'rondas' ? (
        <div className="flex flex-col gap-5">
          <div>
            <span className="text-sm uppercase tracking-widest text-amber-400 font-bold block">
              Paso 1 de 2
            </span>
            <p className="text-base text-slate-300 mt-1">
              ¿Cuántas rondas tendrá la partida?
            </p>
          </div>

          <FichasNumero
            etiqueta="Cantidad de rondas"
            min={1}
            max={maxRondas}
            valor={cantidadRondas}
            onElegir={ajustarCantidadRondas}
          />

          <span className="text-sm text-slate-400 text-center">
            Mínimo 1, máximo {maxRondas} rondas
          </span>

          <button
            type="button"
            onClick={avanzarACartas}
            className="w-full py-3.5 btn-blanco-marron rounded-2xl font-black"
          >
            Continuar ➔
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <span className="text-sm uppercase tracking-widest text-amber-400 font-bold block">
              Paso 2 de 2
            </span>
            <p className="text-base text-slate-300 mt-1">
              Configurá las cartas por ronda:
            </p>
          </div>

          <div className="flex flex-col gap-0.5 pr-1">
            {cartasPorRonda.map((cantidad, indice) => (
              <div
                key={indice}
                className="flex flex-col gap-2 py-3 border-b border-slate-800/60 last:border-b-0"
              >
                <span className="text-base font-bold text-slate-200">
                  Ronda - {indice + 1}
                </span>
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

          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={() => onGuardar(cartasPorRonda)}
              className="w-full py-3.5 btn-blanco-marron rounded-2xl font-black"
            >
              Guardar y volver al menú
            </button>
            <button
              type="button"
              onClick={() => setPaso('rondas')}
              className="w-full py-3 btn-marron-oscuro rounded-2xl font-bold"
            >
              Volver
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
