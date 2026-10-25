import { useState } from 'react';
import { useApp } from '../../../estado/AppProvider';
import { avatarDe } from '../../../datos/avatares';
import { AvatarPirata } from '../../../ui/AvatarPirata';
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
    <section className="flex flex-1 flex-col gap-4">
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
          <div key={originalIndex} className="tarjeta-marron flex flex-col gap-3 p-4">
            <div className="flex items-center gap-3">
              <AvatarPirata emoji={avatarDe(jugador.permanenteId, jugador.avatar)} tamano="md" />
              <div className="min-w-0 flex-1">
                <span className="block truncate text-xl font-black text-white">{jugador.nombre}</span>
                <span className="block text-sm font-bold text-amber-300">Envite: {jugador.apuesta}</span>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-base font-black ${
                  acerto
                    ? 'border border-emerald-500/60 bg-emerald-950/70 text-emerald-300'
                    : 'border border-red-500/60 bg-red-950/70 text-red-300'
                }`}
              >
                {acerto ? '✓ Exacto' : '✕ Fuera'}
              </span>
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
