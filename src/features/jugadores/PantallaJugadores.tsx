import { useMemo, useState } from 'react';
import { useApp } from '../../estado/AppProvider';
import { useGestosMultiDedo } from '../../ui/useGestosMultiDedo';
import { calcularPorcentajeVictorias } from '../../dominio/estadisticas';
import { calcularRendimientos, construirSeriesEvolucion } from '../../dominio/comparativas';
import { GraficoEvolucion } from '../../ui/GraficoEvolucion';
import { AVATAR_BARBAGRIS } from '../../dominio/barbagris';
import { AVATARES, avatarDe } from '../../datos/avatares';
import { AvatarPirata } from '../../ui/AvatarPirata';
import { SelectorAvatar } from '../../ui/SelectorAvatar';
import { SelectorColor } from '../../ui/SelectorColor';
import { colorAvatarDe, colorGraficoDe, colorTarjetaDe, coloresParaNuevo } from '../../datos/coloresJugador';
import type { NombreTono } from '../../ui/tonos';
import type { JugadorPermanente } from '../../tipos';
import { ModalConfirmarEliminacionJugador } from './ModalConfirmarEliminacionJugador';
import { ModalConfirmacion } from '../../ui/ModalConfirmacion';
import { ModalAviso } from '../../ui/ModalAviso';
import { compartirTarjetaResultado, compartirTexto, textoResultado } from '../../infra/compartir';
import type { DatosResultado, ResultadoCompartir } from '../../infra/compartir';
import type { EntradaHistorialPartida } from '../../tipos';

type Vista = 'gestor' | 'historial' | 'estadisticas';

export function PantallaJugadores() {
  const {
    setPantallaActual,
    jugadoresPermanentes,
    crearJugadorPermanente,
    renombrarJugadorPermanente,
    cambiarAvatarJugadorPermanente,
    cambiarColoresJugadorPermanente,
    eliminarJugadorPermanente,
    verEstadisticasJugador,
    partida,
  } = useApp();

  const [vista, setVista] = useState<Vista>('gestor');
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [avatarNuevo, setAvatarNuevo] = useState(AVATARES[0]!);
  const [avatarAbierto, setAvatarAbierto] = useState<string | null>(null);
  const [coloresElegidos, setColoresNuevo] = useState<{ colorTarjeta: NombreTono; colorAvatar: NombreTono } | null>(null);
  const coloresNuevo = coloresElegidos ?? coloresParaNuevo(jugadoresPermanentes);
  const [edicion, setEdicion] = useState<{ id: string; nombre: string } | null>(null);
  const [jugadorPendienteEliminar, setJugadorPendienteEliminar] =
    useState<JugadorPermanente | null>(null);

  const crear = () => {
    const nuevo = crearJugadorPermanente(nombreNuevo, avatarNuevo, coloresNuevo);
    if (nuevo) {
      setNombreNuevo('');
      setColoresNuevo(null);
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
          <section className="tarjeta pergamino flex flex-col gap-3 p-4">
            <h3 className="tarjeta-titulo">Nueva tarjeta de jugador</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAvatarAbierto(avatarAbierto === 'nuevo' ? null : 'nuevo')}
                aria-label="Elegir icono del nuevo pirata"
                className="shrink-0 px-1"
              >
                <AvatarPirata emoji={avatarNuevo} fondo={coloresNuevo.colorAvatar} tamano="md" />
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
              <div className="flex flex-col gap-3">
                <SelectorAvatar valor={avatarNuevo} onCambiar={setAvatarNuevo} />
                <SelectorColor
                  titulo="Color de la tarjeta"
                  valor={coloresNuevo.colorTarjeta}
                  bloqueado={coloresNuevo.colorAvatar}
                  onCambiar={(tono) => setColoresNuevo({ ...coloresNuevo, colorTarjeta: tono })}
                />
                <SelectorColor
                  titulo="Fondo del emoji"
                  valor={coloresNuevo.colorAvatar}
                  bloqueado={coloresNuevo.colorTarjeta}
                  onCambiar={(tono) => setColoresNuevo({ ...coloresNuevo, colorAvatar: tono })}
                />
                <button type="button" onClick={() => setAvatarAbierto(null)} className="btn-claro px-4 py-2.5 text-sm font-bold">
                  Listo
                </button>
              </div>
            )}
          </section>

          {jugadoresPermanentes.length === 0 ? (
            <div className="tarjeta pergamino p-8 text-center text-sm text-slate-500">Todavía no hay tarjetas de jugadores. ¡Creá la primera arriba!</div>
          ) : (
            jugadoresPermanentes.map((jug) => (
              <div key={jug.id} className="flex flex-col gap-2">
                <div className="tarjeta pergamino flex items-center justify-between gap-2 p-3">
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
                        <AvatarPirata emoji={avatarDe(jug.id, jug.avatar)} fondo={colorAvatarDe(jug.id, jug.colorAvatar, jug.colorTarjeta)} tamano="lg" />
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
                  <div className="mt-2 flex flex-col gap-3">
                    <SelectorAvatar
                      valor={avatarDe(jug.id, jug.avatar)}
                      onCambiar={(emoji) => cambiarAvatarJugadorPermanente(jug.id, emoji)}
                    />
                    <SelectorColor
                      titulo="Color de la tarjeta"
                      valor={colorTarjetaDe(jug.id, jug.colorTarjeta)}
                      bloqueado={colorAvatarDe(jug.id, jug.colorAvatar, jug.colorTarjeta)}
                      onCambiar={(tono) => cambiarColoresJugadorPermanente(jug.id, { colorTarjeta: tono, colorAvatar: colorAvatarDe(jug.id, jug.colorAvatar, jug.colorTarjeta) })}
                    />
                    <SelectorColor
                      titulo="Fondo del emoji"
                      valor={colorAvatarDe(jug.id, jug.colorAvatar, jug.colorTarjeta)}
                      bloqueado={colorTarjetaDe(jug.id, jug.colorTarjeta)}
                      onCambiar={(tono) => cambiarColoresJugadorPermanente(jug.id, { colorTarjeta: colorTarjetaDe(jug.id, jug.colorTarjeta), colorAvatar: tono })}
                    />
                    <button type="button" onClick={() => setAvatarAbierto(null)} className="btn-claro px-4 py-2.5 text-sm font-bold">
                      Listo
                    </button>
                  </div>
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
            <div className="tarjeta pergamino p-8 text-center text-sm text-slate-500">Creá tarjetas de jugadores para ver sus estadísticas.</div>
          ) : (
            estadisticasOrdenadas.map((jug, posicion) => (
              <button
                key={jug.id}
                type="button"
                onClick={() => verEstadisticasJugador(jug)}
                className="tarjeta pergamino flex items-center gap-3 p-3 text-left"
              >
                <span className="w-6 shrink-0 text-center text-sm font-bold text-slate-400">{posicion + 1}</span>
                <AvatarPirata emoji={avatarDe(jug.id, jug.avatar)} fondo={colorAvatarDe(jug.id, jug.colorAvatar, jug.colorTarjeta)} tamano="md" />
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-base font-bold text-azul">{jug.nombre}</span>
                  <span className="text-xs font-semibold text-slate-500">
                    {jug.estadisticas.partidasJugadas} {jug.estadisticas.partidasJugadas === 1 ? 'jugada' : 'jugadas'} · 🏆 {jug.estadisticas.victorias}
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
    <section className="tarjeta pergamino p-4">
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
  jugadores: { permanenteId?: string; nombre: string; historial: import('../../tipos').EntradaHistorialRonda[] }[];
}) {
  const { jugadoresPermanentes } = useApp();
  const evolucion = useMemo(
    () => construirSeriesEvolucion(jugadores.map((j) => ({ ...j, color: colorGraficoDe(jugadoresPermanentes, j) }))),
    [jugadores, jugadoresPermanentes]
  );
  return <GraficoEvolucion series={evolucion.series} etiquetas={evolucion.etiquetas} />;
}

const MENSAJES_COMPARTIR: Record<ResultadoCompartir, string | null> = {
  compartido: null,
  cancelado: null,
  copiado: 'Resultado copiado al portapapeles.',
  descargado: 'La tarjeta se descargó como imagen PNG.',
  error: 'No se pudo compartir desde este dispositivo.',
};

/** Compartir una partida ya terminada del historial: texto o tarjeta PNG con el gráfico. */
function BotonesCompartirPartida({ partidaGuardada }: { partidaGuardada: EntradaHistorialPartida }) {
  const { jugadoresPermanentes } = useApp();
  const [aviso, setAviso] = useState<string | null>(null);
  const [trabajando, setTrabajando] = useState(false);

  const armarDatos = (): DatosResultado => {
    const conFantasma = partidaGuardada.barbagris ? [...partidaGuardada.ranking, partidaGuardada.barbagris] : partidaGuardada.ranking;
    const series = construirSeriesEvolucion(conFantasma.map((j) => ({ ...j, color: colorGraficoDe(jugadoresPermanentes, j) })));
    return {
      ranking: partidaGuardada.ranking.map((j) => ({ nombre: j.nombre, puntos: j.puntos })),
      fecha: partidaGuardada.fecha,
      rondas: Math.max(0, ...partidaGuardada.ranking.map((j) => j.historial.length)),
      series,
    };
  };

  const ejecutar = async (accion: (datos: DatosResultado) => Promise<ResultadoCompartir>) => {
    if (trabajando) return;
    setTrabajando(true);
    try {
      setAviso(MENSAJES_COMPARTIR[await accion(armarDatos())]);
    } finally {
      setTrabajando(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" disabled={trabajando} onClick={() => void ejecutar((d) => compartirTexto('Skull King', textoResultado(d)))} className="btn-claro py-2.5 text-xs">
          📤 Compartir
        </button>
        <button type="button" disabled={trabajando} onClick={() => void ejecutar(compartirTarjetaResultado)} className="btn-claro py-2.5 text-xs">
          🖼️ Tarjeta (PNG)
        </button>
      </div>
      <ModalAviso abierto={aviso !== null} titulo="Compartir" mensaje={aviso} onCerrar={() => setAviso(null)} textoBoton="OK" zIndex="z-[80]" />
    </>
  );
}

function fechaCorta(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '';
  return fecha.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/** Partidas que quedaron sin terminar: aparecen arriba del historial para retomarlas o descartarlas. */
function PartidasEnCursoHistorial() {
  const { partida } = useApp();
  const { partidasGuardadas, continuarPartida, descartarPartidaPorId } = partida;
  const [aDescartar, setADescartar] = useState<string | null>(null);
  if (partidasGuardadas.length === 0) return null;

  return (
    <>
      {partidasGuardadas.map((guardada) => {
        const ranking = [...guardada.jugadores].sort((a, b) => b.puntos - a.puntos);
        const totalRondas = guardada.cartasPorRondaActivas.length || 10;
        return (
          <div key={guardada.id} className="tarjeta pergamino flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-800">En curso</span>
              <span className="text-xs font-bold text-slate-500">{fechaCorta(guardada.actualizada)}</span>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Ronda {guardada.rondaActual} de {totalRondas}
            </span>
            <div className="flex flex-col gap-1.5">
              {ranking.map((jug, indice) => (
                <div key={jug.permanenteId || jug.nombre} className="opcion flex items-center justify-between px-3 py-2">
                  <span className="truncate text-sm font-semibold text-tinta">
                    {indice + 1}.º {jug.nombre}
                  </span>
                  <span className="shrink-0 pl-2 font-bold text-tinta">{jug.puntos} pts</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => continuarPartida(guardada.id)} className="btn-primario py-2.5 text-sm">
                Reanudar
              </button>
              <button type="button" onClick={() => setADescartar(guardada.id)} className="btn-peligro py-2.5 text-sm">
                Descartar
              </button>
            </div>
          </div>
        );
      })}
      <ModalConfirmacion
        abierto={aDescartar !== null}
        titulo="¿Descartar esta partida?"
        descripcion="La partida en curso se borra y no se guarda en el historial."
        textoConfirmar="Descartar"
        onConfirmar={() => {
          if (aDescartar) descartarPartidaPorId(aDescartar);
          setADescartar(null);
        }}
        onCancelar={() => setADescartar(null)}
        zIndex="z-[70]"
      />
    </>
  );
}

function VistaHistorial() {
  const { partida, verHistorialJugador } = useApp();
  const { historialPartidas, eliminarPartidaHistorial, borrarTodoElHistorial, partidasGuardadas } = partida;
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
      <PartidasEnCursoHistorial />
      {historialPartidas.length === 0 ? (
        partidasGuardadas.length > 0 ? null :
        <div className="tarjeta pergamino p-8 text-center text-sm text-slate-500">No hay partidas registradas.</div>
      ) : (
        historialPartidas.map((partidaGuardada, hIndex) => (
          <div key={hIndex} className="tarjeta pergamino flex flex-col gap-3 p-4">
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
              {partidaGuardada.barbagris && (
                <button
                  type="button"
                  onClick={() => verHistorialJugador(partidaGuardada.barbagris!)}
                  className="flex items-center justify-between rounded-xl border border-slate-400 bg-slate-100 px-3 py-2 text-left"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <AvatarPirata emoji={AVATAR_BARBAGRIS} fondo="pizarra" tamano="sm" />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-semibold text-slate-700">{partidaGuardada.barbagris.nombre}</span>
                      <span className="text-[11px] text-slate-500">
                        {partidaGuardada.barbagris.puntos > (partidaGuardada.ranking[0]?.puntos ?? 0)
                          ? 'El fantasma le ganó a todos'
                          : 'Fantasma de la partida de 2 · Ver detalles'}
                      </span>
                    </span>
                  </span>
                  <span className="shrink-0 pl-2 font-bold text-slate-700">{partidaGuardada.barbagris.puntos} pts</span>
                </button>
              )}
            </div>
            <BotonesCompartirPartida partidaGuardada={partidaGuardada} />
            {partidaGuardada.ranking.some((jug) => jug.historial.length > 0) && (
              <>
                <button
                  type="button"
                  onClick={() => alternarGrafico(hIndex)}
                  aria-expanded={graficosAbiertos.has(hIndex)}
                  className="btn-claro py-2.5 text-xs"
                >
                  {graficosAbiertos.has(hIndex) ? '▲ Ocultar evolución' : '📈 Ver evolución por ronda'}
                </button>
                {graficosAbiertos.has(hIndex) && <GraficoPartidaHistorial jugadores={partidaGuardada.barbagris ? [...partidaGuardada.ranking, partidaGuardada.barbagris] : partidaGuardada.ranking} />}
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
