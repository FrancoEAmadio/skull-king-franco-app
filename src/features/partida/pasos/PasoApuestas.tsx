import { ContadorMasMenos } from '../../../ui/ContadorMasMenos';
import { useApp } from '../../../estado/AppProvider';

export function PasoApuestas() {
  const { partida } = useApp();
  const {
    jugadoresOrdenados,
    cartasPorJugadorEnRonda,
    configuracionMesa,
    cambiarApuesta,
    cambiarModoEnvite,
    avanzarAPasoBazas,
  } = partida;

  return (
    <section className="flex flex-col gap-4 flex-1 overflow-y-auto">
      <div className="tarjeta-marron p-3.5">
        <span className="text-xs font-bold text-amber-300 uppercase block">2. Fase de Envites</span>
        <span className="text-[10px] text-slate-300 block mt-0.5">
          Anotá cuántas bazas pronostica ganar cada pirata en esta ronda.
        </span>
      </div>

      {jugadoresOrdenados.map(({ jugador, originalIndex }) => (
        <div
          key={originalIndex}
          className="tarjeta-marron p-3.5 flex flex-col gap-2.5 border-l-4 border-amber-500"
        >
          <div className="flex items-center justify-between">
            <span className="font-black text-white text-base">{jugador.nombre}</span>
            <ContadorMasMenos
              valor={jugador.apuesta}
              onDecrementar={() => cambiarApuesta(originalIndex, -1)}
              onIncrementar={() => cambiarApuesta(originalIndex, 1)}
              decrementarDisabled={jugador.apuesta <= 0}
              incrementarDisabled={jugador.apuesta >= cartasPorJugadorEnRonda}
            />
          </div>

          {configuracionMesa.usarModoBribon && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => cambiarModoEnvite(originalIndex, 'metralla')}
                className={`py-2 rounded-lg text-[11px] font-bold border ${
                  jugador.modoEnvite === 'metralla' ? 'btn-blanco-marron' : 'btn-marron-oscuro'
                }`}
              >
                🖐️ Metralla (Seguro)
              </button>
              <button
                type="button"
                onClick={() => cambiarModoEnvite(originalIndex, 'bala')}
                className={`py-2 rounded-lg text-[11px] font-bold border ${
                  jugador.modoEnvite === 'bala' ? 'btn-blanco-marron' : 'btn-marron-oscuro'
                }`}
              >
                ✊ Bala de Cañón (Riesgo)
              </button>
            </div>
          )}
        </div>
      ))}

      <button
        onClick={avanzarAPasoBazas}
        className="w-full mt-1 py-4 btn-blanco-marron text-lg rounded-2xl font-black shadow-xl"
      >
        Siguiente: Registro de Bazas ➔
      </button>
    </section>
  );
}
