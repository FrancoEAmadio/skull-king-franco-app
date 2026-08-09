import { BONO_ALIANZA_BOTIN, MAX_ALIANZAS_POR_RONDA } from '../constantes';
import type { AlianzaBotin, Jugador } from '../tipos';

export function calcularBonosAlianzasBotin(
  alianzas: AlianzaBotin[],
  jugadores: Jugador[]
): Record<number, number> {
  const bonosPorIndice: Record<number, number> = {};
  jugadores.forEach((_, idx) => {
    bonosPorIndice[idx] = 0;
  });

  const alianzasEfectivas = alianzas.slice(0, MAX_ALIANZAS_POR_RONDA);

  for (const alianza of alianzasEfectivas) {
    const jugadorA = jugadores[alianza.idxA];
    const jugadorB = jugadores[alianza.idxB];
    if (!jugadorA || !jugadorB) continue;

    const aciertoA = jugadorA.apuesta === jugadorA.ganadas;
    const aciertoB = jugadorB.apuesta === jugadorB.ganadas;

    if (aciertoA && aciertoB) {
      bonosPorIndice[alianza.idxA] += BONO_ALIANZA_BOTIN;
      bonosPorIndice[alianza.idxB] += BONO_ALIANZA_BOTIN;
    }
  }

  return bonosPorIndice;
}
