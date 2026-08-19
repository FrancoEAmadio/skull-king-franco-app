import { ContadorMasMenos } from '../../../ui/ContadorMasMenos';
import { useApp } from '../../../estado/AppProvider';

export function PasoBazas() {
  const { partida } = useApp();
  const {
    jugadoresOrdenados,
    cartasPorJugadorEnRonda,
    totalGanadasAsignadas,
    cambiarGanadas,
    maxGanadasPara,
    limpiarBazasRonda,
    avanzarAPasoBonos,
  } = partida;

  return (
    <section className="flex flex-col gap-4 flex-1 overflow-y-auto">
      <div className="tarjeta-marron p-3.5 flex items-center justify-between border-l-4 border-emerald-500">
        <div>
          <span className="text-xs font-bold text-amber-300 uppercase block">3. Registro de Bazas</span>
          <span className="text-[10px] text-slate-300 block mt-0.5">
            Anotá cuántas bazas ganó cada jugador (pueden ser menos si nadie la ganó).
          </span>
        </div>
        <button
          type="button"
          onClick={limpiarBazasRonda}
          className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1.5 rounded-lg border border-slate-700 font-bold shrink-0"
        >
          🔄 Limpiar
        </button>
      </div>

      <div className="tarjeta-marron p-3 flex items-center justify-between border-l-4 border-amber-500">
        <span className="text-xs font-bold text-slate-300 uppercase">Bazas registradas</span>
        <span className="text-lg font-black text-amber-300">
          {totalGanadasAsignadas} / {cartasPorJugadorEnRonda} máx
        </span>
      </div>

      {jugadoresOrdenados.map(({ jugador, originalIndex }) => (
        <div
          key={originalIndex}
          className="tarjeta-marron p-3.5 flex items-center justify-between border-l-4 border-emerald-500/70"
        >
          <span className="font-black text-white text-base">{jugador.nombre}</span>
          <ContadorMasMenos
            valor={jugador.ganadas}
            colorValor="text-emerald-400"
            onDecrementar={() => cambiarGanadas(originalIndex, -1)}
            onIncrementar={() => cambiarGanadas(originalIndex, 1)}
            decrementarDisabled={jugador.ganadas <= 0}
            incrementarDisabled={jugador.ganadas >= maxGanadasPara(originalIndex)}
          />
        </div>
      ))}

      <button
        onClick={avanzarAPasoBonos}
        className="w-full mt-1 py-4 btn-blanco-marron text-lg rounded-2xl font-black shadow-xl"
      >
        Siguiente: Bonos ➔
      </button>
    </section>
  );
}
