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
    avanzarAPasoPuntos,
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
      <div className="tarjeta flex items-center justify-between gap-3 p-4">
        <div>
          <span className="tarjeta-titulo block">Envites</span>
          <span className="block text-lg font-black leading-tight text-azul">¿Cuántas bazas ganás?</span>
        </div>
        <div className="text-right">
          <span className="block text-3xl font-black leading-none text-azul">{sumaApuestas}</span>
          <span className="block text-xs font-bold text-slate-500">de {cartasPorJugadorEnRonda} bazas</span>
        </div>
      </div>

      {jugadoresOrdenados.map(({ jugador, originalIndex }) => (
        <div key={originalIndex} className="tarjeta flex flex-col gap-3 p-4">
          <div className="flex items-center gap-3">
            <AvatarPirata emoji={avatarDe(jugador.permanenteId, jugador.avatar)} tamano="md" />
            <span className="min-w-0 flex-1 truncate text-lg font-black text-azul">{jugador.nombre}</span>
            <span
              className={`rounded-full px-3 py-1 text-base font-black ${
                jugador.apuestaElegida ? 'bg-oro text-tinta-oro' : 'border border-dashed border-slate-300 text-slate-400'
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
            <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => cambiarModoEnvite(originalIndex, 'metralla')}
                className={`min-h-11 px-2 py-2.5 text-sm font-bold ${jugador.modoEnvite === 'metralla' ? 'opcion opcion-sel' : 'opcion'}`}
              >
                🖐️ Metralla
              </button>
              <button
                type="button"
                onClick={() => cambiarModoEnvite(originalIndex, 'bala')}
                className={`min-h-11 px-2 py-2.5 text-sm font-bold ${jugador.modoEnvite === 'bala' ? 'opcion opcion-sel' : 'opcion'}`}
              >
                ✊ Bala de Cañón
              </button>
            </div>
          )}
        </div>
      ))}

      <div className="barra-inferior mt-auto">
        <button type="button" onClick={avanzarAPasoPuntos} disabled={!completo} className="btn-dorado w-full py-3.5 text-base">
          {completo ? 'Cerrar envites ➔' : `Faltan envites (${elegidas}/${total})`}
        </button>
      </div>
    </section>
  );
}
