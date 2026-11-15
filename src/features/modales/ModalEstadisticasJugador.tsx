import { useApp } from '../../estado/AppProvider';
import { EncabezadoModal, Modal } from '../../ui/Modal';
import { calcularPorcentajeAciertos, calcularPorcentajeVictorias } from '../../dominio/estadisticas';

function Dato({ valor, etiqueta, color = 'text-azul' }: { valor: string | number; etiqueta: string; color?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
      <span className={`block font-display text-xl font-black ${color}`}>{valor}</span>
      <span className="text-[11px] font-bold uppercase leading-tight text-slate-500">{etiqueta}</span>
    </div>
  );
}

export function ModalEstadisticasJugador() {
  const { jugadorPermanenteViendoStats, cerrarEstadisticasJugador, jugadoresPermanentes } = useApp();

  const jugador = jugadorPermanenteViendoStats
    ? (jugadoresPermanentes.find((j) => j.id === jugadorPermanenteViendoStats.id) ?? jugadorPermanenteViendoStats)
    : null;

  return (
    <Modal abierto={!!jugador} onCerrar={cerrarEstadisticasJugador} ancho="max-w-md" zIndex="z-[70]" cerrarAlHacerClickAfuera>
      {jugador && (
        <>
          <EncabezadoModal titulo={`🏴‍☠️ ${jugador.nombre}`} subtitulo="Perfil pirata" onCerrar={cerrarEstadisticasJugador} />

          <div className="scroll-oculto flex flex-1 flex-col gap-3 overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-2.5">
              <Dato valor={jugador.estadisticas.partidasJugadas} etiqueta="Partidas" />
              <Dato
                valor={
                  jugador.estadisticas.partidasJugadas
                    ? `${jugador.estadisticas.victorias} de ${jugador.estadisticas.partidasJugadas} · ${calcularPorcentajeVictorias(jugador)}%`
                    : '—'
                }
                etiqueta="Victorias"
                color="text-emerald-700"
              />
              <Dato valor={`🥈 ${jugador.estadisticas.segundoPuesto}`} etiqueta="2º puesto" />
              <Dato valor={`🥉 ${jugador.estadisticas.tercerPuesto}`} etiqueta="3º puesto" />
              <Dato valor={`${calcularPorcentajeAciertos(jugador)}%`} etiqueta="Envites acertados" />
              <Dato valor={jugador.estadisticas.mejorPartida ?? '—'} etiqueta="Mejor partida" color="text-emerald-700" />
              <Dato valor={jugador.estadisticas.peorPartida ?? '—'} etiqueta="Peor partida" color="text-rojo-osc" />
            </div>

            {jugador.evolucion.length > 0 && (
              <section className="rounded-xl border border-slate-200 p-3.5">
                <h4 className="tarjeta-titulo mb-2">Últimas partidas</h4>
                <ul className="flex flex-col">
                  {[...jugador.evolucion]
                    .reverse()
                    .slice(0, 8)
                    .map((entrada, indice) => (
                      <li key={`${entrada.fecha}-${indice}`} className="fila-puntaje py-1.5 text-sm">
                        <span className="text-slate-500">{entrada.fecha}</span>
                        <span className="shrink-0 font-bold text-tinta">
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
