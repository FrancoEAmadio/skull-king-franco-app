import { useEffect, useState } from 'react';
import { useApp } from '../../../estado/AppProvider';
import { MAX_ALIANZAS_POR_RONDA } from '../../../constantes';
import { ModalAviso } from '../../../ui/ModalAviso';
import { Seccion } from '../../../ui/Seccion';

/** Alianzas de Botín del jugador que se está anotando: solo hay que elegir con quién se alió. */
export function PanelAlianzasBotin({ numero }: { numero?: number }) {
  const { partida } = useApp();
  const { jugadores, jugadorSeleccionadoIdx, alianzasBotinRonda, agregarAlianzaBotin, eliminarAlianzaBotin } = partida;

  const activo = jugadores[jugadorSeleccionadoIdx];
  const [idxOtro, setIdxOtro] = useState<number | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  // Al cambiar de jugador se limpia la elección anterior.
  useEffect(() => {
    setIdxOtro(null);
  }, [jugadorSeleccionadoIdx]);

  if (!activo) return null;

  const limiteAlcanzado = alianzasBotinRonda.length >= MAX_ALIANZAS_POR_RONDA;
  const otros = jugadores.map((jug, idx) => ({ jug, idx })).filter(({ idx }) => idx !== jugadorSeleccionadoIdx);

  const registrar = () => {
    if (idxOtro === null) {
      setAviso('Elegí con quién se alió.');
      return;
    }
    const resultado = agregarAlianzaBotin(jugadorSeleccionadoIdx, idxOtro);
    if (resultado === 'limite_alcanzado') {
      setAviso(`Ya se registraron las ${MAX_ALIANZAS_POR_RONDA} alianzas de esta ronda (hay 2 cartas de Botín).`);
    } else if (resultado === 'regla_inactiva') {
      setAviso('La regla de Botín no está activa en esta partida.');
    } else if (resultado === 'alianza_agregada') {
      setIdxOtro(null);
    }
  };

  return (
    <Seccion numero={numero} titulo="Alianzas de botín" marcador={`${alianzasBotinRonda.length}/${MAX_ALIANZAS_POR_RONDA}`}>

      {!limiteAlcanzado && (
        <>
          <span className="text-sm font-bold text-tinta">
            Alianza de <span className="text-azul">{activo.nombre}</span> con:
          </span>
          <div className="flex flex-wrap gap-2">
            {otros.map(({ jug, idx }) => (
              <button
                key={idx}
                type="button"
                aria-pressed={idxOtro === idx}
                onClick={() => setIdxOtro(idx)}
                className={`px-4 py-2.5 text-sm ${
                  idxOtro === idx ? 'btn-dorado' : 'btn-claro'
                }`}
              >
                {jug.nombre}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={registrar}
            className="btn-dorado w-full py-3 text-sm"
          >
            + Registrar alianza
          </button>
        </>
      )}

      {alianzasBotinRonda.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {alianzasBotinRonda.map((alianza, idx) => (
            <span
              key={idx}
              className="flex items-center gap-2 rounded-full border border-oro bg-slate-50 py-1 pl-3 pr-1 text-base font-bold text-azul"
            >
              {alianza.nombreA} 🤝 {alianza.nombreB}
              <button
                type="button"
                onClick={() => eliminarAlianzaBotin(idx)}
                aria-label={`Borrar alianza ${alianza.nombreA} y ${alianza.nombreB}`}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-red-700"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      <ModalAviso
        abierto={aviso !== null}
        titulo="Alianza de botín"
        mensaje={aviso ?? ''}
        textoBoton="Entendido"
        onCerrar={() => setAviso(null)}
      />
    </Seccion>
  );
}
