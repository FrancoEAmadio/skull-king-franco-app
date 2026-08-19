import { useApp } from '../../../estado/AppProvider';

export function PasoResumen() {
  const { partida, abrirPodio } = useApp();
  const {
    resumenRondaActual,
    partidaFinalizada,
    partidaPendienteFinalizar,
    rondaVisible,
    irASiguienteRonda,
    confirmarFinalizacionPartida,
  } = partida;

  const confirmarResultadoFinal = () => {
    confirmarFinalizacionPartida();
    abrirPodio();
  };

  return (
    <section className="flex flex-col gap-4 flex-1 overflow-y-auto">
      <div className="tarjeta-marron p-3.5 border-l-4 border-amber-500">
        <span className="text-xs font-bold text-amber-300 uppercase block">
          5. Resumen de la Ronda {rondaVisible}
        </span>
        <span className="text-[10px] text-slate-300 block mt-0.5">
          {partidaFinalizada
            ? '¡Partida finalizada! Resultados acumulados.'
            : partidaPendienteFinalizar
              ? 'Revisá el resultado antes de confirmar definitivamente la partida.'
              : 'Puntaje de la ronda antes de continuar.'}
        </span>
      </div>

      {resumenRondaActual.map((res) => (
        <div key={res.nombre} className="tarjeta-marron p-3.5 flex flex-col gap-2">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <span className="font-black text-white text-lg">{res.nombre}</span>
            <span
              className={`text-xs font-bold px-2 py-1 rounded-full ${
                res.acierto
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-red-950 text-red-400 border border-red-800'
              }`}
            >
              {res.acierto ? '✓ Acertó' : '✕ Falló'} ({res.ganadas} de {res.apuesta})
            </span>
          </div>

          <div className="flex justify-between text-xs text-slate-300">
            <span>Puntaje base:</span>
            <span className="font-bold text-white">
              {res.puntajeBase > 0 ? '+' : ''}
              {res.puntajeBase}
            </span>
          </div>

          {res.bonosCobradas && res.bonosCobradas.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-emerald-400 font-bold uppercase">
                ✓ Bonificaciones y Apuestas:
              </span>
              {res.bonosCobradas.map((b, i) => (
                <div
                  key={`rc-${i}`}
                  className={`flex justify-between text-[11px] px-2 py-1 rounded-lg border ${
                    b.subtotal >= 0
                      ? 'text-emerald-300 bg-emerald-950/30 border-emerald-900/40'
                      : 'text-red-300 bg-red-950/30 border-red-900/40'
                  }`}
                >
                  <span>
                    {b.etiqueta} {b.cantidad > 1 && `×${b.cantidad}`}
                  </span>
                  <span className="font-bold">
                    {b.subtotal > 0 ? '+' : ''}
                    {b.subtotal}
                  </span>
                </div>
              ))}
            </div>
          )}

          {res.bonosNoCobradas && res.bonosNoCobradas.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                ✕ Bonos no cobrados por fallar envite:
              </span>
              {res.bonosNoCobradas.map((b, i) => (
                <div
                  key={`rn-${i}`}
                  className="flex justify-between text-[11px] text-slate-400 bg-slate-900/60 px-2 py-1 rounded-lg border border-slate-800"
                >
                  <span className="line-through">
                    {b.etiqueta} {b.cantidad > 1 && `×${b.cantidad}`}
                  </span>
                  <span className="line-through">+{b.subtotal}</span>
                </div>
              ))}
            </div>
          )}

          {res.habilidadesRegistradas && res.habilidadesRegistradas.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-purple-300 font-bold uppercase">
                🏴‍☠️ Habilidades usadas:
              </span>
              {res.habilidadesRegistradas.map((hab, i) => (
                <div
                  key={`rh-${i}`}
                  className="text-[11px] text-purple-200 bg-purple-950/30 px-2 py-1 rounded-lg border border-purple-900/40"
                >
                  {hab.etiqueta}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between items-end pt-2 border-t border-slate-800">
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 uppercase font-bold">Total ronda</span>
              <span
                className={`font-black text-xl ${
                  res.totalRonda >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {res.totalRonda > 0 ? '+' : ''}
                {res.totalRonda}
              </span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[9px] text-amber-300/70 uppercase font-bold">Acumulado</span>
              <span className="font-black text-2xl text-amber-400">{res.acumuladoNuevo}</span>
            </div>
          </div>
        </div>
      ))}

      {partidaFinalizada ? (
        <button
          onClick={abrirPodio}
          className="w-full mt-1 py-4 btn-blanco-marron text-lg rounded-2xl font-black shadow-xl"
        >
          🏁 Ver Resultado Final
        </button>
      ) : partidaPendienteFinalizar ? (
        <button
          onClick={confirmarResultadoFinal}
          className="w-full mt-1 py-4 btn-blanco-marron text-lg rounded-2xl font-black shadow-xl"
        >
          Confirmar Resultado Final
        </button>
      ) : (
        <button
          onClick={irASiguienteRonda}
          className="w-full mt-1 py-4 btn-blanco-marron text-lg rounded-2xl font-black shadow-xl"
        >
          Siguiente Ronda ➔
        </button>
      )}
    </section>
  );
}
