import { useMemo } from 'react';
import { useApp } from '../../estado/AppProvider';
import { Modal } from '../../ui/Modal';
import { calcularPromedioPuntos, calcularPorcentajeAciertos } from '../../dominio/estadisticas';
import {
  buscarRendimiento,
  calcularRendimientos,
  compararContraElResto,
} from '../../dominio/comparativas';
import type { FilaComparacion } from '../../dominio/comparativas';

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
      <span className={`block text-xl font-black ${color}`}>{valor}</span>
      <span className="text-[11px] font-bold uppercase leading-tight text-slate-400">{etiqueta}</span>
    </div>
  );
}

function FilaComparativa({ fila }: { fila: FilaComparacion }) {
  const tope = Math.max(fila.jugador, fila.resto ?? 0, 1);
  const anchoJugador = Math.max(4, (Math.max(fila.jugador, 0) / tope) * 100);
  const anchoResto = fila.resto === null ? 0 : Math.max(4, (Math.max(fila.resto, 0) / tope) * 100);
  const mejorQueResto = fila.resto !== null && fila.jugador > fila.resto;
  const igual = fila.resto !== null && fila.jugador === fila.resto;
  return (
    <div className="flex flex-col gap-1.5 border-b border-slate-800 pb-3 last:border-none last:pb-0">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-bold text-slate-200">{fila.etiqueta}</span>
        <span className="text-[11px] font-bold text-slate-400">
          Puesto <span className="text-amber-300">#{fila.puesto}</span> de {fila.de}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full ${mejorQueResto ? 'bg-emerald-400' : igual ? 'bg-amber-400' : 'bg-rose-400'}`}
            style={{ width: `${anchoJugador}%` }}
          />
        </div>
        <span className="w-16 shrink-0 text-right text-sm font-black text-white">
          {fila.jugador}
          {fila.sufijo}
        </span>
      </div>
      {fila.resto !== null && (
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-slate-500" style={{ width: `${anchoResto}%` }} />
          </div>
          <span className="w-16 shrink-0 text-right text-[11px] font-semibold text-slate-400">
            {fila.resto}
            {fila.sufijo}
          </span>
        </div>
      )}
    </div>
  );
}

export function ModalEstadisticasJugador() {
  const { jugadorPermanenteViendoStats, cerrarEstadisticasJugador, jugadoresPermanentes, partida } = useApp();
  const { historialPartidas } = partida;

  // Se toma la versión más reciente de la tarjeta por si cambió con el modal abierto.
  const jugador = jugadorPermanenteViendoStats
    ? (jugadoresPermanentes.find((j) => j.id === jugadorPermanenteViendoStats.id) ?? jugadorPermanenteViendoStats)
    : null;

  const rendimientos = useMemo(
    () => calcularRendimientos(historialPartidas, jugadoresPermanentes),
    [historialPartidas, jugadoresPermanentes]
  );
  const propio = jugador ? buscarRendimiento(rendimientos, jugador) : null;
  const comparacion = propio ? compararContraElResto(rendimientos, propio) : [];
  const hayOtros = rendimientos.filter((r) => r.partidas > 0).length > 1;

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
              <h3 className="text-xs font-black uppercase tracking-widest text-amber-300">Perfil Pirata</h3>
              <span className="block truncate text-2xl font-bold text-white">🏴‍☠️ {jugador.nombre}</span>
            </div>
            <button
              type="button"
              onClick={cerrarEstadisticasJugador}
              aria-label="Cerrar perfil"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-xl font-bold text-slate-300 hover:bg-slate-700 hover:text-white"
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

            {(jugador.estadisticas.capturasSkullKing > 0 ||
              jugador.estadisticas.capturasSirena > 0 ||
              jugador.estadisticas.capturasMonstruo > 0) && (
              <div className="grid grid-cols-3 gap-2.5">
                <Dato valor={jugador.estadisticas.capturasSkullKing} etiqueta="Capturas Skull King" />
                <Dato valor={jugador.estadisticas.capturasSirena} etiqueta="Capturas Sirena" />
                <Dato valor={jugador.estadisticas.capturasMonstruo} etiqueta="Capturas Monstruo" />
              </div>
            )}

            <section className="rounded-2xl border border-slate-700 bg-slate-900/60 p-3.5">
              <h4 className="mb-1 text-xs font-black uppercase tracking-wider text-amber-300">
                Comparativa con el resto de la mesa
              </h4>
              {propio && propio.rondasJugadas > 0 ? (
                <>
                  <p className="mb-3 text-[11px] leading-relaxed text-slate-400">
                    Barra de color: {jugador.nombre}. Barra gris: promedio del resto de los jugadores.
                    {!hayOtros && ' Todavía no hay otros jugadores con partidas para comparar.'}
                  </p>
                  <div className="mb-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2">
                      <span className="block text-lg font-black text-white">{propio.mejorRacha}</span>
                      <span className="text-[11px] font-bold uppercase leading-tight text-slate-400">
                        Racha de aciertos
                      </span>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2">
                      <span className="block text-lg font-black text-white">{propio.bonosPorRonda}</span>
                      <span className="text-[11px] font-bold uppercase leading-tight text-slate-400">
                        Bonos por ronda
                      </span>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2">
                      <span className="block text-lg font-black text-white">{propio.efectividadBonos}%</span>
                      <span className="text-[11px] font-bold uppercase leading-tight text-slate-400">
                        Bonos cobrados
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    {comparacion.map((fila) => (
                      <FilaComparativa key={fila.metrica} fila={fila} />
                    ))}
                  </div>
                  <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
                    “Bonos cobrados” mide qué parte de las bonificaciones se llegó a sumar (solo se cobran
                    acertando el envite). Se calcula con las {propio.rondasJugadas} rondas guardadas en el
                    historial.
                  </p>
                </>
              ) : (
                <p className="text-xs leading-relaxed text-slate-400">
                  Todavía no hay rondas guardadas en el historial para {jugador.nombre}. Terminá una partida
                  para ver cómo rinde frente al resto.
                </p>
              )}
            </section>

            {jugador.evolucion.length > 0 && (
              <section className="rounded-2xl border border-slate-700 bg-slate-900/60 p-3.5">
                <h4 className="mb-2 text-xs font-black uppercase tracking-wider text-amber-300">
                  Últimas partidas
                </h4>
                <ul className="flex flex-col gap-1.5">
                  {[...jugador.evolucion]
                    .reverse()
                    .slice(0, 8)
                    .map((entrada, indice) => (
                      <li
                        key={`${entrada.fecha}-${indice}`}
                        className="flex items-center justify-between gap-2 text-xs"
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
