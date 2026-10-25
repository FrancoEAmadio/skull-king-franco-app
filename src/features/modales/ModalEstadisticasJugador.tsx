import { useApp } from '../../estado/AppProvider';
import { Modal } from '../../ui/Modal';
import { calcularPromedioPuntos, calcularPorcentajeAciertos } from '../../dominio/estadisticas';

function Dato({
  valor,
  etiqueta,
  color = 'text-white',
}: {
  valor: string | number;
  etiqueta: string;
  color?: string;
}) {
  return (
    <div className="tarjeta-marron p-3 text-center">
      <span className={`block text-2xl font-black ${color}`}>{valor}</span>
      <span className="text-sm font-bold uppercase leading-tight text-slate-400">{etiqueta}</span>
    </div>
  );
}

export function ModalEstadisticasJugador() {
  const { jugadorPermanenteViendoStats, cerrarEstadisticasJugador, jugadoresPermanentes } = useApp();

  // Se toma la versión más reciente de la tarjeta por si cambió con el modal abierto.
  const jugador = jugadorPermanenteViendoStats
    ? (jugadoresPermanentes.find((j) => j.id === jugadorPermanenteViendoStats.id) ?? jugadorPermanenteViendoStats)
    : null;

  return (
    <Modal
      abierto={!!jugador}
      onCerrar={cerrarEstadisticasJugador}
      ancho="max-w-md"
      zIndex="z-[70]"
      cerrarAlHacerClickAfuera
    >
      {jugador && (
        <>
          <div className="flex shrink-0 items-center justify-between border-b border-amber-900/60 bg-slate-900 p-4">
            <div className="min-w-0">
              <h3 className="text-sm font-black uppercase tracking-widest text-amber-300">Perfil Pirata</h3>
              <span className="block truncate text-3xl font-bold text-white">🏴‍☠️ {jugador.nombre}</span>
            </div>
            <button
              type="button"
              onClick={cerrarEstadisticasJugador}
              aria-label="Cerrar perfil"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-2xl font-bold text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="scroll-oculto flex flex-1 flex-col gap-4 overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-2.5">
              <Dato valor={jugador.estadisticas.partidasJugadas} etiqueta="Partidas" color="text-amber-300" />
              <Dato valor={`🥇 ${jugador.estadisticas.victorias}`} etiqueta="Victorias" color="text-emerald-400" />
              <Dato valor={`🥈 ${jugador.estadisticas.segundoPuesto}`} etiqueta="2º puesto" color="text-slate-200" />
              <Dato valor={`🥉 ${jugador.estadisticas.tercerPuesto}`} etiqueta="3º puesto" color="text-amber-600" />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Dato valor={calcularPromedioPuntos(jugador)} etiqueta="Promedio pts" />
              <Dato valor={`${calcularPorcentajeAciertos(jugador)}%`} etiqueta="Envites acertados" />
              <Dato
                valor={jugador.estadisticas.mejorPartida ?? '—'}
                etiqueta="Mejor partida"
                color="text-emerald-300"
              />
              <Dato
                valor={jugador.estadisticas.peorPartida ?? '—'}
                etiqueta="Peor partida"
                color="text-rose-300"
              />
            </div>

            {jugador.evolucion.length > 0 && (
              <section className="rounded-2xl border border-slate-700 bg-slate-900/60 p-3.5">
                <h4 className="mb-2 text-sm font-black uppercase tracking-wider text-amber-300">
                  Últimas partidas
                </h4>
                <ul className="flex flex-col gap-1.5">
                  {[...jugador.evolucion]
                    .reverse()
                    .slice(0, 8)
                    .map((entrada, indice) => (
                      <li
                        key={`${entrada.fecha}-${indice}`}
                        className="flex items-center justify-between gap-2 text-sm"
                      >
                        <span className="text-slate-400">{entrada.fecha}</span>
                        <span className="shrink-0 font-bold text-white">
                          {['🥇', '🥈', '🥉'][entrada.posicion - 1] ?? `${entrada.posicion}º`} · {entrada.puntos} pts
                        </span>
                      </li>
                    ))}
                </ul>
              </section>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}
