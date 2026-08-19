import { useState } from 'react';
import { useApp } from '../../estado/AppProvider';
import { calcularPromedioPuntos } from '../../dominio/estadisticas';
import type { JugadorPermanente } from '../../tipos';
import { ModalConfirmarEliminacionJugador } from './ModalConfirmarEliminacionJugador';

type Vista = 'gestor' | 'historial' | 'estadisticas';

export function PantallaJugadores() {
  const {
    setPantallaActual,
    jugadoresPermanentes,
    crearJugadorPermanente,
    renombrarJugadorPermanente,
    eliminarJugadorPermanente,
    verEstadisticasJugador,
    partida,
  } = useApp();

  const [vista, setVista] = useState<Vista>('gestor');
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [edicion, setEdicion] = useState<{ id: string; nombre: string } | null>(null);
  const [jugadorPendienteEliminar, setJugadorPendienteEliminar] =
    useState<JugadorPermanente | null>(null);

  const crear = () => {
    const nuevo = crearJugadorPermanente(nombreNuevo);
    if (nuevo) setNombreNuevo('');
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
        className="text-sm text-amber-300 font-bold self-start"
      >
        ← Volver al menú
      </button>
      <h2 className="text-2xl font-bold text-white">Jugadores, Estadísticas e Historial</h2>

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
            className={`py-2.5 px-2 rounded-xl font-bold text-[11px] border ${
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
            <input
              value={nombreNuevo}
              onChange={(e) => setNombreNuevo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && crear()}
              type="text"
              placeholder="Nombre del nuevo pirata..."
              className="flex-1 rounded-xl px-3.5 py-2.5 text-sm text-white bg-slate-900 border border-slate-700 focus:outline-none focus:border-amber-500"
            />
            <button onClick={crear} className="px-4 py-2.5 btn-blanco-marron rounded-xl font-bold text-sm">
              + Crear
            </button>
          </div>

          {jugadoresPermanentes.length === 0 ? (
            <div className="tarjeta-marron p-8 text-center text-slate-300 text-sm">
              Todavía no hay tarjetas de jugadores. ¡Creá la primera arriba!
            </div>
          ) : (
            jugadoresPermanentes.map((jug) => (
              <div key={jug.id} className="tarjeta-marron p-3.5 flex items-center justify-between gap-2">
                {edicion?.id === jug.id ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      value={edicion.nombre}
                      onChange={(e) => setEdicion({ ...edicion, nombre: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && guardarEdicion()}
                      type="text"
                      className="flex-1 rounded-lg px-2.5 py-1.5 text-sm text-white bg-slate-900 border border-amber-600 focus:outline-none"
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
                    <button onClick={() => verEstadisticasJugador(jug)} className="flex-1 text-left">
                      <span className="font-black text-white text-base block">🏴‍☠️ {jug.nombre}</span>
                      <span className="text-[10px] text-slate-400">
                        {jug.estadisticas.partidasJugadas} partida
                        {jug.estadisticas.partidasJugadas === 1 ? '' : 's'} · 🏆{' '}
                        {jug.estadisticas.victorias} · Prom. {calcularPromedioPuntos(jug)} pts
                      </span>
                    </button>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => iniciarEdicion(jug)}
                        className="w-8 h-8 btn-marron-oscuro rounded-lg text-xs"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => setJugadorPendienteEliminar(jug)}
                        aria-label={`Eliminar a ${jug.nombre}`}
                        className="w-8 h-8 bg-red-950/80 border border-red-800 text-red-300 rounded-lg text-xs"
                      >
                        🗑️
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {vista === 'historial' && <VistaHistorial />}

      {vista === 'estadisticas' && (
        <div className="flex flex-col gap-3">
          {jugadoresPermanentes.length === 0 ? (
            <div className="tarjeta-marron p-8 text-center text-slate-300 text-sm">
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
                  <span className="font-black text-white text-base block">🏴‍☠️ {jug.nombre}</span>
                  <span className="text-[10px] text-slate-400">
                    {jug.estadisticas.partidasJugadas} partidas · 🥇 {jug.estadisticas.victorias} · 🥈{' '}
                    {jug.estadisticas.segundoPuesto} · 🥉 {jug.estadisticas.tercerPuesto}
                  </span>
                </div>
                <span className="text-amber-300 font-black text-lg">
                  {calcularPromedioPuntos(jug)} <span className="text-[10px] font-normal">pts prom.</span>
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

function VistaHistorial() {
  const { partida, verHistorialJugador } = useApp();
  const { historialPartidas, eliminarPartidaHistorial, borrarTodoElHistorial } = partida;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        {historialPartidas.length > 0 && (
          <button
            onClick={borrarTodoElHistorial}
            className="text-xs bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-200 px-3 py-1.5 rounded-xl font-bold"
          >
            Borrar Historial
          </button>
        )}
      </div>
      {historialPartidas.length === 0 ? (
        <div className="tarjeta-marron p-8 text-center text-slate-300 text-sm">
          No hay partidas registradas.
        </div>
      ) : (
        historialPartidas.map((partidaGuardada, hIndex) => (
          <div key={hIndex} className="tarjeta-marron p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-amber-900/50 pb-2">
              <span className="text-xs font-bold text-amber-300">{partidaGuardada.fecha}</span>
              <button
                onClick={() => eliminarPartidaHistorial(hIndex)}
                className="text-xs text-slate-400 hover:text-red-400 font-bold"
              >
                ✕ Eliminar
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              {partidaGuardada.ranking.map((jug, jIndex) => (
                <div
                  key={jIndex}
                  onClick={() => verHistorialJugador(jug)}
                  className={`flex justify-between items-center px-3 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-colors hover:brightness-110 ${
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
                    <span className="text-[9px] opacity-75">🔍 Toca para ver historial</span>
                  </div>
                  <span className="font-extrabold text-amber-300">{jug.puntos} pts</span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
