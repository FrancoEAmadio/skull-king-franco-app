import { useApp } from '../../../estado/AppProvider';
import { avatarDe } from '../../../datos/avatares';
import { AvatarPirata } from '../../../ui/AvatarPirata';
import { FichasNumero } from '../../../ui/FichasNumero';

export function PasoApuestas() {
  const { partida } = useApp();
  const {
    jugadoresOrdenados,
    cartasPorJugadorEnRonda,
    configuracionMesa,
    elegirApuesta,
    cambiarModoEnvite,
    avanzarAPasoBazas,
  } = partida;

  const elegidas = jugadoresOrdenados.filter(({ jugador }) => jugador.apuestaElegida).length;
  const total = jugadoresOrdenados.length;
  const completo = elegidas === total;
  const sumaApuestas = jugadoresOrdenados.reduce(
    (acc, { jugador }) => acc + (jugador.apuestaElegida ? jugador.apuesta : 0),
    0
  );

  return (
    <section className="flex flex-1 flex-col gap-4">
      <div className="tarjeta-marron flex items-center justify-between gap-3 p-4">
        <div>
          <span className="block text-sm font-bold uppercase tracking-widest text-amber-300">Envites</span>
          <span className="block text-lg font-extrabold leading-tight text-white">
            ¿Cuántas bazas ganás?
          </span>
        </div>
        <div className="text-right">
          <span className="block text-3xl font-black leading-none text-amber-300">{sumaApuestas}</span>
          <span className="block text-sm font-bold text-slate-300">de {cartasPorJugadorEnRonda} bazas</span>
        </div>
      </div>

      {jugadoresOrdenados.map(({ jugador, originalIndex }) => (
        <div key={originalIndex} className="tarjeta-marron flex flex-col gap-3 p-4">
          <div className="flex items-center gap-3">
            <AvatarPirata emoji={avatarDe(jugador.permanenteId, jugador.avatar)} tamano="md" />
            <span className="min-w-0 flex-1 truncate text-xl font-black text-white">{jugador.nombre}</span>
            <span
              className={`rounded-full px-3 py-1 text-lg font-black ${
                jugador.apuestaElegida
                  ? 'bg-amber-400 text-amber-950'
                  : 'border border-dashed border-slate-500 text-slate-400'
              }`}
            >
              {jugador.apuestaElegida ? jugador.apuesta : '?'}
            </span>
          </div>

          <FichasNumero
            etiqueta={`Envite de ${jugador.nombre}`}
            valor={jugador.apuestaElegida ? jugador.apuesta : null}
            max={cartasPorJugadorEnRonda}
            onElegir={(numero) => elegirApuesta(originalIndex, numero)}
          />

          {configuracionMesa.usarModoBribon && (
            <div className="grid grid-cols-2 gap-2 border-t border-slate-700 pt-3">
              <button
                type="button"
                onClick={() => cambiarModoEnvite(originalIndex, 'metralla')}
                className={`rounded-xl py-3 text-base font-bold ${
                  jugador.modoEnvite === 'metralla' ? 'btn-blanco-marron' : 'btn-marron-oscuro'
                }`}
              >
                🖐️ Metralla
              </button>
              <button
                type="button"
                onClick={() => cambiarModoEnvite(originalIndex, 'bala')}
                className={`rounded-xl py-3 text-base font-bold ${
                  jugador.modoEnvite === 'bala' ? 'btn-blanco-marron' : 'btn-marron-oscuro'
                }`}
              >
                ✊ Bala de Cañón
              </button>
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={avanzarAPasoBazas}
        disabled={!completo}
        className="btn-blanco-marron sticky bottom-3 w-full rounded-2xl py-4 text-xl font-black shadow-xl disabled:opacity-50"
      >
        <span className="block text-sm font-bold opacity-80">
          {elegidas}/{total} envites
        </span>
        {completo ? 'Cerrar envites ➔' : 'Faltan envites'}
      </button>
    </section>
  );
}
