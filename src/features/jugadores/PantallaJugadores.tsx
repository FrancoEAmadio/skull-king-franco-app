import { useMemo, useState } from 'react';
import { useApp } from '../../estado/AppProvider';
import { useGestosMultiDedo } from '../../ui/useGestosMultiDedo';
import { calcularPorcentajeVictorias } from '../../dominio/estadisticas';
import { calcularRendimientos, construirSeriesEvolucion } from '../../dominio/comparativas';
import { GraficoEvolucion } from '../../ui/GraficoEvolucion';
import { AVATARES, avatarDe } from '../../datos/avatares';
import { AvatarPirata } from '../../ui/AvatarPirata';
import { SelectorAvatar } from '../../ui/SelectorAvatar';
import type { JugadorPermanente } from '../../tipos';
import { ModalConfirmarEliminacionJugador } from './ModalConfirmarEliminacionJugador';

type Vista = 'gestor' | 'historial' | 'estadisticas';

export function PantallaJugadores() {
  const {
    setPantallaActual,
    jugadoresPermanentes,
    crearJugadorPermanente,
    renombrarJugadorPermanente,
    cambiarAvatarJugadorPermanente,
    eliminarJugadorPermanente,
    verEstadisticasJugador,
    partida,
  } = useApp();

  const [vista, setVista] = useState<Vista>('gestor');
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [avatarNuevo, setAvatarNuevo] = useState(AVATARES[0]!);
  const [avatarAbierto, setAvatarAbierto] = useState<string | null>(null);
  const [edicion, setEdicion] = useState<{ id: string; nombre: string } | null>(null);
  const [jugadorPendienteEliminar, setJugadorPendienteEliminar] =
    useState<JugadorPermanente | null>(null);

  const crear = () => {
    const nuevo = crearJugadorPermanente(nombreNuevo, avatarNuevo);
    if (nuevo) {
      setNombreNuevo('');
      setAvatarNuevo(AVATARES[(AVATARES.indexOf(avatarNuevo) + 1) % AVATARES.length]!);
    }
  };

  const iniciarEdicion = (jug: JugadorPermanente) =>
    setEdicion({ id: jug.id, nombre: jug.nombre });

  const guardarEdicion = () => {
    if (!edicion) return;
    renombrarJugadorPermanente(edicion.id, edicion.nombre);
    setEdicion(null);
  };

  const confirmarEliminacion = () => {
    if (!jugadorPendienteEliminar) return;
    eliminarJugadorPermanente(jugadorPendienteEliminar.id);
    setJugadorPendienteEliminar(null);
  };

  const estadisticasOrdenadas = useMemo(
    () =>
      [...jugadoresPermanentes].sort(
        (a, b) =>
          b.estadisticas.victorias - a.estadisticas.victorias ||
          calcularPorcentajeVictorias(b) - calcularPorcentajeVictorias(a) ||
          b.estadisticas.partidasJugadas - a.estadisticas.partidasJugadas ||
          a.nombre.localeCompare(b.nombre)
      ),
    [jugadoresPermanentes]
  );

  const ORDEN = ['gestor', 'estadisticas', 'historial'] as const;
  const gestos = useGestosMultiDedo({
    dos: (dir) => {
      const i = ORDEN.indexOf(vista as (typeof ORDEN)[number]) + dir;
      if (i >= 0 && i < ORDEN.length) setVista(ORDEN[i]!);
    },
  });

  return (
    <main className="entrar flex w-full flex-col gap-4 py-4" {...gestos}>
      <button type="button" onClick={() => setPantallaActual('inicio')} className="btn-fantasma self-start px-3 py-2 text-sm">
        ← Volver al menú
      </button>
      <h2 className="font-display text-2xl font-bold text-white">Jugadores, Estadísticas e Historial</h2>

      <div className="grid grid-cols-3 gap-2">
        {(
          [
            ['gestor', 'Jugadores'],
            ['estadisticas', 'Estadísticas'],
            ['historial', 'Historial'],
          ] as const
        ).map(([id, etiqueta]) => (
          <button
            key={id}
            type="button"
            onClick={() => setVista(id)}
            aria-pressed={vista === id}
            className={`px-1 py-3 text-xs ${vista === id ? 'btn-primario' : 'btn-fantasma'}`}
          >
            {etiqueta}
          </button>
        ))}
      </div>

      {vista === 'gestor' && (
        <div className="flex flex-col gap-3">
          <section className="tarjeta flex flex-col gap-3 p-4">
            <h3 className="tarjeta-titulo">Nueva tarjeta de jugador</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAvatarAbierto(avatarAbierto === 'nuevo' ? null : 'nuevo')}
                aria-label="Elegir icono del nuevo pirata"
                className="btn-claro shrink-0 px-2"
              >
                <AvatarPirata emoji={avatarNuevo} tamano="md" />
              </button>
              <input
                value={nombreNuevo}
                onChange={(e) => setNombreNuevo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && crear()}
                type="text"
                placeholder="Nombre del nuevo pirata..."
                className="campo min-w-0 flex-1"
              />
              <button type="button" onClick={crear} className="btn-primario shrink-0 px-4 text-sm">
                + Crear
              </button>
            </div>
            {avatarAbierto === 'nuevo' && (
              <SelectorAvatar
                valor={avatarNuevo}
                onCambiar={(emoji) => {
                  setAvatarNuevo(emoji);
                  setAvatarAbierto(null);
                }}
              />
            )}
          </section>

          {jugadoresPermanentes.length === 0 ? (
            <div className="tarjeta p-8 text-center text-sm text-slate-500">Todavía no hay tarjetas de jugadores. ¡Creá la primera arriba!</div>
          ) : (
            jugadoresPermanentes.map((jug) => (
              <div key={jug.id} className="flex flex-col gap-2">
                <div className="tarjeta flex items-center justify-between gap-2 p-3">
                  {edicion?.id === jug.id ? (
                    <div className="flex flex-1 gap-2">
                      <input
                        value={edicion.nombre}
                        onChange={(e) => setEdicion({ ...edicion, nombre: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && guardarEdicion()}
                        type="text"
                        className="campo min-w-0 flex-1"
                      />
                      <button type="button" onClick={guardarEdicion} aria-label="Guardar nombre" className="btn-primario h-11 w-11 shrink-0">
                        ✓
                      </button>
                      <button type="button" onClick={() => setEdicion(null)} aria-label="Cancelar edición" className="btn-claro h-11 w-11 shrink-0">
                        ✕
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setAvatarAbierto(avatarAbierto === jug.id ? null : jug.id)}
                        aria-label={`Cambiar icono de ${jug.nombre}`}
                        className="shrink-0"
                      >
                        <AvatarPirata emoji={avatarDe(jug.id, jug.avatar)} tamano="lg" />
                      </button>
                      <button type="button" onClick={() => verEstadisticasJugador(jug)} className="min-w-0 flex-1 text-left">
                        <span className="block truncate text-lg font-bold text-azul">{jug.nombre}</span>
                        <span className="text-xs font-semibold text-slate-500">
                          {jug.estadisticas.partidasJugadas} partida{jug.estadisticas.partidasJugadas === 1 ? '' : 's'} · 🏆{' '}
                          {jug.estadisticas.victorias} · {jug.estadisticas.partidasJugadas ? `${calcularPorcentajeVictorias(jug)}% victorias` : 'sin partidas'}
                        </span>
                      </button>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <button type="button" onClick={() => iniciarEdicion(jug)} aria-label={`Editar a ${jug.nombre}`} className="btn-claro h-10 w-10 text-lg">
                          ✏️
                        </button>
                        <button
                          type="button"
                          onClick={() => setJugadorPendienteEliminar(jug)}
                          aria-label={`Eliminar a ${jug.nombre}`}
                          className="btn-peligro h-10 w-10 text-lg !text-white"
                        >
                          ✕
                        </button>
                      </div>
                    </>
                  )}
                </div>
                {avatarAbierto === jug.id && (
                  <SelectorAvatar
                    valor={avatarDe(jug.id, jug.avatar)}
                    onCambiar={(emoji) => {
                      cambiarAvatarJugadorPermanente(jug.id, emoji);
                      setAvatarAbierto(null);
                    }}
                  />
                )}
              </div>
            ))
          )}
        </div>
      )}

      {vista === 'historial' && <VistaHistorial />}

      {vista === 'estadisticas' && (
        <div className="flex flex-col gap-3">
          <TablaComparativa />
          {jugadoresPermanentes.length === 0 ? (
            <div className="tarjeta p-8 text-center text-sm text-slate-500">Creá tarjetas de jugadores para ver sus estadísticas.</div>
          ) : (
            estadisticasOrdenadas.map((jug, posicion) => (
              <button
                key={jug.id}
                type="button"
                onClick={() => verEstadisticasJugador(jug)}
                className="tarjeta flex items-center gap-3 p-3 text-left"
              >
                <span className="w-6 shrink-0 text-center text-sm font-bold text-slate-400">{posicion + 1}</span>
                <AvatarPirata emoji={avatarDe(jug.id, jug.avatar)} tamano="md" />
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-base font-bold text-azul">{jug.nombre}</span>
                  <span className="text-xs font-semibold text-slate-500">
                    {jug.estadisticas.partidasJugadas} jugadas · 🏆 {jug.estadisticas.victorias}
                    {jug.estadisticas.mejorPartida !== null ? ` · récord ${jug.estadisticas.mejorPartida}` : ''}
                  </span>
                </div>
                <span className="shrink-0 text-right">
                  <span className="block text-2xl font-bold text-azul">
                    {jug.estadisticas.partidasJugadas ? `${calcularPorcentajeVictorias(jug)}%` : '—'}
                  </span>
                  <span className="block text-[10px] font-semibold uppercase text-slate-400">victorias</span>
                </span>
              </button>
            ))
          )}
        </div>
      )}
      <span className="hidden">{partida.hayPartidaGuardada}</span>

      <ModalConfirmarEliminacionJugador
        jugador={jugadorPendienteEliminar}
        onCancelar={() => setJugadorPendienteEliminar(null)}
        onConfirmar={confirmarEliminacion}
      />
    </main>
  );
}

function TablaComparativa() {
  const { jugadoresPermanentes, partida, verEstadisticasJugador } = useApp();
  const rendimientos = useMemo(
    () =>
      calcularRendimientos(partida.historialPartidas, jugadoresPermanentes)
        .filter((r) => r.partidas > 0)
        .sort(
          (a, b) =>
            b.victorias - a.victorias ||
            b.porcentajeVictorias - a.porcentajeVictorias ||
            b.partidas - a.partidas ||
            a.nombre.localeCompare(b.nombre)
        ),
    [partida.historialPartidas, jugadoresPermanentes]
  );

  if (rendimientos.length === 0) return null;

  return (
    <section className="tarjeta p-4">
      <h3 className="tarjeta-titulo mb-3">⚔️ Comparativa de la tripulación</h3>
      <div className="-mx-1 overflow-x-auto">
        <table className="w-full min-w-[19rem] border-collapse text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400">
              <th className="px-1 pb-2 font-semibold">Pirata</th>
              <th className="px-1 pb-2 text-right font-semibold">PJ</th>
              <th className="px-1 pb-2 text-right font-semibold">Vict.</th>
              <th className="px-1 pb-2 text-right font-semibold">% Vict.</th>
              <th className="px-1 pb-2 text-right font-semibold">Envites</th>
              <th className="px-1 pb-2 text-right font-semibold">Racha</th>
            </tr>
          </thead>
          <tbody>
            {rendimientos.map((r) => {
              const tarjeta = jugadoresPermanentes.find(
                (j) => r.clave === `id:${j.id}` || r.clave === `n:${j.nombre.trim().toLowerCase()}`
              );
              return (
                <tr key={r.clave} className="border-t border-slate-100">
                  <td className="max-w-[7rem] px-1 py-2 font-semibold text-tinta">
                    {tarjeta ? (
                      <button
                        type="button"
                        onClick={() => verEstadisticasJugador(tarjeta)}
                        className="block max-w-full truncate text-left text-azul underline decoration-dotted underline-offset-2"
                      >
                        {r.nombre}
                      </button>
                    ) : (
                      <span className="block truncate">{r.nombre}</span>
                    )}
                  </td>
                  <td className="px-1 py-2 text-right text-slate-600">{r.partidas}</td>
                  <td className="px-1 py-2 text-right text-slate-600">{r.victorias}</td>
                  <td className="px-1 py-2 text-right font-semibold text-azul">{r.partidas ? `${r.porcentajeVictorias}%` : '—'}</td>
                  <td className="px-1 py-2 text-right text-slate-600">{r.precisionEnvites}%</td>
                  <td className="px-1 py-2 text-right text-slate-600">{r.mejorRacha}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function GraficoPartidaHistorial({
  jugadores,
}: {
  jugadores: { nombre: string; historial: import('../../tipos').EntradaHistorialRonda[] }[];
}) {
  const evolucion = useMemo(() => construirSeriesEvolucion(jugadores), [jugadores]);
  return <GraficoEvolucion series={evolucion.series} etiquetas={evolucion.etiquetas} />;
}

function VistaHistorial() {
  const { partida, verHistorialJugador } = useApp();
  const { historialPartidas, eliminarPartidaHistorial, borrarTodoElHistorial } = partida;
  const [graficosAbiertos, setGraficosAbiertos] = useState<Set<number>>(new Set());

  const alternarGrafico = (indice: number) =>
    setGraficosAbiertos((previos) => {
      const siguiente = new Set(previos);
      if (siguiente.has(indice)) siguiente.delete(indice);
      else siguiente.add(indice);
      return siguiente;
    });

  return (
    <div className="flex flex-col gap-3">
      {historialPartidas.length === 0 ? (
        <div className="tarjeta p-8 text-center text-sm text-slate-500">No hay partidas registradas.</div>
      ) : (
        historialPartidas.map((partidaGuardada, hIndex) => (
          <div key={hIndex} className="tarjeta flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-azul">{partidaGuardada.fecha}</span>
              <button type="button" onClick={() => eliminarPartidaHistorial(hIndex)} className="btn-peligro px-3 py-2 text-xs">
                Eliminar
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              {partidaGuardada.ranking.map((jug, jIndex) => (
                <button
                  type="button"
                  key={jIndex}
                  onClick={() => verHistorialJugador(jug)}
                  className={`flex items-center justify-between px-3 py-2 text-left ${jIndex === 0 ? 'opcion opcion-sel' : 'opcion'}`}
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-semibold text-tinta">
                      {jIndex + 1}.º {jug.nombre}
                    </span>
                    <span className="text-[11px] text-slate-500">Ver detalles</span>
                  </span>
                  <span className="shrink-0 pl-2 font-bold text-tinta">{jug.puntos} pts</span>
                </button>
              ))}
            </div>
            {partidaGuardada.ranking.some((jug) => jug.historial.length > 1) && (
              <>
                <button
                  type="button"
                  onClick={() => alternarGrafico(hIndex)}
                  aria-expanded={graficosAbiertos.has(hIndex)}
                  className="btn-claro py-2.5 text-xs"
                >
                  {graficosAbiertos.has(hIndex) ? '▲ Ocultar evolución' : '📈 Ver evolución por ronda'}
                </button>
                {graficosAbiertos.has(hIndex) && <GraficoPartidaHistorial jugadores={partidaGuardada.ranking} />}
              </>
            )}
          </div>
        ))
      )}
      {historialPartidas.length > 0 && (
        <button type="button" onClick={borrarTodoElHistorial} className="btn-peligro mx-auto mt-2 px-5 py-3 text-sm">
          Borrar historial
        </button>
      )}
    </div>
  );
}
