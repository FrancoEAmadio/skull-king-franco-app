import { useMemo, useState } from 'react';
import { useApp } from '../../estado/AppProvider';
import { calcularPromedioPuntos } from '../../dominio/estadisticas';
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

  return (
    <main className="py-6 overflow-y-auto w-full flex flex-col gap-4">
      <button
        onClick={() => setPantallaActual('inicio')}
        className="text-base text-amber-300 font-bold self-start"
      >
        ← Volver al menú
      </button>
      <h2 className="text-3xl font-bold text-white">Jugadores, Estadísticas e Historial</h2>

      <div className="grid grid-cols-3 gap-2">
        {(
          [
            ['gestor', '👤 Jugadores'],
            ['historial', '📜 Historial'],
            ['estadisticas', '📊 Estadísticas'],
          ] as const
        ).map(([id, etiqueta]) => (
          <button
            key={id}
            onClick={() => setVista(id)}
            className={`py-2.5 px-2 rounded-xl font-bold text-sm border ${
              vista === id ? 'btn-blanco-marron' : 'btn-marron-oscuro'
            }`}
          >
            {etiqueta}
          </button>
        ))}
      </div>

      {vista === 'gestor' && (
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAvatarAbierto(avatarAbierto === 'nuevo' ? null : 'nuevo')}
              aria-label="Elegir icono del nuevo pirata"
              className="btn-marron-oscuro flex shrink-0 items-center justify-center rounded-xl px-2"
            >
              <AvatarPirata emoji={avatarNuevo} tamano="md" />
            </button>
            <input
              value={nombreNuevo}
              onChange={(e) => setNombreNuevo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && crear()}
              type="text"
              placeholder="Nombre del nuevo pirata..."
              className="flex-1 rounded-xl px-3.5 py-2.5 text-base text-white bg-slate-900 border border-slate-700 focus:outline-none focus:border-amber-500"
            />
            <button onClick={crear} className="px-4 py-2.5 btn-blanco-marron rounded-xl font-bold text-base">
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

          {jugadoresPermanentes.length === 0 ? (
            <div className="tarjeta-marron p-8 text-center text-slate-300 text-base">
              Todavía no hay tarjetas de jugadores. ¡Creá la primera arriba!
            </div>
          ) : (
            jugadoresPermanentes.map((jug) => (
              <div key={jug.id} className="flex flex-col gap-2">
              <div className="tarjeta-marron p-3.5 flex items-center justify-between gap-2">
                {edicion?.id === jug.id ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      value={edicion.nombre}
                      onChange={(e) => setEdicion({ ...edicion, nombre: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && guardarEdicion()}
                      type="text"
                      className="flex-1 rounded-lg px-2.5 py-1.5 text-base text-white bg-slate-900 border border-amber-600 focus:outline-none"
                    />
                    <button onClick={guardarEdicion} className="text-emerald-400 font-bold px-2">
                      ✓
                    </button>
                    <button onClick={() => setEdicion(null)} className="text-slate-400 font-bold px-2">
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
                    <button onClick={() => verEstadisticasJugador(jug)} className="min-w-0 flex-1 text-left">
                      <span className="font-black text-white text-xl block truncate">{jug.nombre}</span>
                      <span className="text-base text-slate-300">
                        {jug.estadisticas.partidasJugadas} partida
                        {jug.estadisticas.partidasJugadas === 1 ? '' : 's'} · 🏆{' '}
                        {jug.estadisticas.victorias} · Prom. {calcularPromedioPuntos(jug)} pts
                      </span>
                    </button>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => iniciarEdicion(jug)}
                        className="h-12 w-12 btn-marron-oscuro rounded-xl text-xl"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => setJugadorPendienteEliminar(jug)}
                        aria-label={`Eliminar a ${jug.nombre}`}
                        className="h-12 w-12 bg-red-950/80 border border-red-800 text-red-300 rounded-xl text-xl"
                      >
                        🗑️
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
            <div className="tarjeta-marron p-8 text-center text-slate-300 text-base">
              Creá tarjetas de jugadores para ver sus estadísticas.
            </div>
          ) : (
            jugadoresPermanentes.map((jug) => (
              <button
                key={jug.id}
                onClick={() => verEstadisticasJugador(jug)}
                className="tarjeta-marron p-3.5 flex items-center justify-between text-left"
              >
                <div>
                  <span className="font-black text-white text-lg block">🏴‍☠️ {jug.nombre}</span>
                  <span className="text-sm text-slate-400">
                    {jug.estadisticas.partidasJugadas} partidas · 🥇 {jug.estadisticas.victorias} · 🥈{' '}
                    {jug.estadisticas.segundoPuesto} · 🥉 {jug.estadisticas.tercerPuesto}
                  </span>
                </div>
                <span className="text-amber-300 font-black text-xl">
                  {calcularPromedioPuntos(jug)} <span className="text-sm font-normal">pts prom.</span>
                </span>
              </button>
            ))
          )}
        </div>
      )}
      {/* Sombreado del último item para no perder botón lejos, se usa scroll natural del main */}
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
            b.porcentajeVictorias - a.porcentajeVictorias ||
            b.promedioPuntos - a.promedioPuntos ||
            a.nombre.localeCompare(b.nombre)
        ),
    [partida.historialPartidas, jugadoresPermanentes]
  );

  if (rendimientos.length === 0) return null;

  return (
    <section className="tarjeta-marron p-3.5">
      <h3 className="mb-1 text-base font-black text-amber-300">⚔️ Comparativa de la tripulación</h3>
      <p className="mb-3 text-sm leading-relaxed text-slate-400">
        Ordenada por victorias y puntos. Tocá un nombre para ver su perfil completo contra el resto.
      </p>
      <div className="-mx-1 overflow-x-auto">
        <table className="w-full min-w-[19rem] border-collapse text-sm">
          <thead>
            <tr className="text-left text-sm uppercase tracking-wide text-slate-400">
              <th className="px-1 pb-2 font-bold">Pirata</th>
              <th className="px-1 pb-2 text-right font-bold">PJ</th>
              <th className="px-1 pb-2 text-right font-bold">Vict.</th>
              <th className="px-1 pb-2 text-right font-bold">Prom.</th>
              <th className="px-1 pb-2 text-right font-bold">Envites</th>
              <th className="px-1 pb-2 text-right font-bold">Racha</th>
            </tr>
          </thead>
          <tbody>
            {rendimientos.map((r) => {
              const tarjeta = jugadoresPermanentes.find(
                (j) => r.clave === `id:${j.id}` || r.clave === `n:${j.nombre.trim().toLowerCase()}`
              );
              return (
                <tr key={r.clave} className="border-t border-slate-800">
                  <td className="max-w-[7rem] px-1 py-2 font-bold text-white">
                    {tarjeta ? (
                      <button
                        type="button"
                        onClick={() => verEstadisticasJugador(tarjeta)}
                        className="block max-w-full truncate text-left text-amber-200 underline decoration-dotted underline-offset-2"
                      >
                        {r.nombre}
                      </button>
                    ) : (
                      <span className="block truncate">{r.nombre}</span>
                    )}
                  </td>
                  <td className="px-1 py-2 text-right text-slate-300">{r.partidas}</td>
                  <td className="px-1 py-2 text-right text-slate-300">
                    {r.victorias} <span className="text-slate-400">({r.porcentajeVictorias}%)</span>
                  </td>
                  <td className="px-1 py-2 text-right font-bold text-white">{r.promedioPuntos}</td>
                  <td className="px-1 py-2 text-right text-slate-300">{r.precisionEnvites}%</td>
                  <td className="px-1 py-2 text-right text-slate-300">{r.mejorRacha}</td>
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
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        {historialPartidas.length > 0 && (
          <button
            onClick={borrarTodoElHistorial}
            className="text-sm bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-200 px-3 py-1.5 rounded-xl font-bold"
          >
            Borrar Historial
          </button>
        )}
      </div>
      {historialPartidas.length === 0 ? (
        <div className="tarjeta-marron p-8 text-center text-slate-300 text-base">
          No hay partidas registradas.
        </div>
      ) : (
        historialPartidas.map((partidaGuardada, hIndex) => (
          <div key={hIndex} className="tarjeta-marron p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-amber-900/50 pb-2">
              <span className="text-sm font-bold text-amber-300">{partidaGuardada.fecha}</span>
              <button
                onClick={() => eliminarPartidaHistorial(hIndex)}
                className="text-sm text-slate-400 hover:text-red-400 font-bold"
              >
                ✕ Eliminar
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              {partidaGuardada.ranking.map((jug, jIndex) => (
                <div
                  key={jIndex}
                  onClick={() => verHistorialJugador(jug)}
                  className={`flex justify-between items-center px-3 py-2 rounded-xl text-base font-semibold cursor-pointer transition-colors hover:brightness-110 ${
                    jIndex === 0
                      ? 'btn-blanco-marron'
                      : 'bg-amber-950/40 text-slate-200 border border-amber-900/30'
                  }`}
                >
                  <div className="flex flex-col">
                    <span>
                      {jIndex === 0 ? '🥇' : jIndex === 1 ? '🥈' : jIndex === 2 ? '🥉' : `${jIndex + 1}.`}{' '}
                      {jug.nombre}
                    </span>
                    <span className="text-sm opacity-80">🔍 Tocá para ver historial</span>
                  </div>
                  <span className="font-extrabold text-amber-300">{jug.puntos} pts</span>
                </div>
              ))}
            </div>
            {partidaGuardada.ranking.some((jug) => jug.historial.length > 1) && (
              <>
                <button
                  type="button"
                  onClick={() => alternarGrafico(hIndex)}
                  aria-expanded={graficosAbiertos.has(hIndex)}
                  className="btn-marron-oscuro rounded-xl py-2.5 text-sm"
                >
                  {graficosAbiertos.has(hIndex) ? '▲ Ocultar evolución' : '📈 Ver evolución por ronda'}
                </button>
                {graficosAbiertos.has(hIndex) && (
                  <GraficoPartidaHistorial jugadores={partidaGuardada.ranking} />
                )}
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}
