import { useState } from 'react';
import { useApp } from '../../../estado/AppProvider';
import { FichasNumero } from '../../../ui/FichasNumero';
import { ModalAviso } from '../../../ui/ModalAviso';

export function PasoBazas() {
  const { partida } = useApp();
  const {
    jugadoresOrdenados,
    cartasPorJugadorEnRonda,
    totalGanadasAsignadas,
    elegirGanadas,
    maxGanadasPara,
    limpiarBazasRonda,
    avanzarAPasoBonos,
  } = partida;
  const [mostrarAvisoBazas, setMostrarAvisoBazas] = useState(false);

  const intentarAvanzar = () => {
    if (avanzarAPasoBonos() === 'bazas_excedidas') setMostrarAvisoBazas(true);
  };

  const faltan = cartasPorJugadorEnRonda - totalGanadasAsignadas;

  return (
    <section className="flex flex-1 flex-col gap-3">
      <div className="tarjeta-marron flex items-center justify-between gap-3 p-4">
        <div>
          <span className="block text-sm font-bold uppercase tracking-widest text-amber-300">Bazas ganadas</span>
          <span className="block text-lg font-extrabold leading-tight text-white">
            {faltan > 0 ? `Quedan ${faltan} por asignar` : 'Todas asignadas'}
          </span>
        </div>
        <button
          type="button"
          onClick={limpiarBazasRonda}
          className="btn-marron-oscuro shrink-0 rounded-xl px-4 py-3 text-base font-bold"
        >
          🔄 Limpiar
        </button>
      </div>

      {jugadoresOrdenados.map(({ jugador, originalIndex }) => {
        const acerto = jugador.ganadas === jugador.apuesta;
        return (
          <div key={originalIndex} className="tarjeta-marron flex flex-col gap-2 p-3">
            <div className="grid grid-cols-[4.5rem_1fr_4.5rem] items-center gap-2">
              <div className="flex flex-col items-start leading-none">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Bazas</span>
                <span className={`text-2xl font-black ${acerto ? 'text-emerald-300' : 'text-red-300'}`}>
                  {jugador.ganadas}
                </span>
              </div>
              <span className="truncate text-center text-xl font-black text-white">{jugador.nombre}</span>
              <div className="flex flex-col items-end leading-none">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Envite</span>
                <span className="text-2xl font-black text-amber-300">{jugador.apuesta}</span>
              </div>
            </div>

            <FichasNumero
              etiqueta={`Bazas de ${jugador.nombre}`}
              valor={jugador.ganadas}
              max={cartasPorJugadorEnRonda}
              meta={jugador.apuesta}
              resultado={acerto ? 'ok' : 'mal'}
              deshabilitada={(numero) => numero > maxGanadasPara(originalIndex)}
              onElegir={(numero) => elegirGanadas(originalIndex, numero)}
            />
          </div>
        );
      })}

      <p className="px-1 text-center text-sm font-semibold text-slate-300">
        El aro punteado marca el envite de cada pirata.
      </p>

      <button
        type="button"
        onClick={intentarAvanzar}
        className="btn-blanco-marron sticky bottom-3 w-full rounded-2xl py-4 text-xl font-black shadow-xl"
      >
        Siguiente: Bonos ➔
      </button>

      <ModalAviso
        abierto={mostrarAvisoBazas}
        titulo="Revisá las bazas"
        mensaje={`Asignaste ${totalGanadasAsignadas} bazas, pero esta ronda admite un máximo de ${cartasPorJugadorEnRonda}.`}
        textoBoton="Corregir"
        onCerrar={() => setMostrarAvisoBazas(false)}
      />
    </section>
  );
}
