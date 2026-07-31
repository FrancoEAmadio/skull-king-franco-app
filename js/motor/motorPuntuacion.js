/**
 * js/motor/motorPuntuacion.js
 * Motor matemático de Skull King, con alianzas de Botín (+20 pts si ambos cumplen)
 * y cálculo de comodines.
 */

import { LISTA_EVENTOS_BONO } from '../datos/cartasDatos.js';

export function calcularPuntajeRonda(apuesta, ganadas, numeroRonda, eventosBonoConCantidad = {}, usarModoBribon = false, modoEnvite = 'metralla') {
  const ap = Number(apuesta) || 0;
  const gan = Number(ganadas) || 0;
  const acierto = (ap === gan);
  let puntajeBase = 0;
  let totalBonos = 0;

  // 1. Puntuación Base o Envite del Bribón
  if (usarModoBribon) {
    if (modoEnvite === 'bala') {
      puntajeBase = acierto ? (15 * numeroRonda) : 0;
    } else {
      puntajeBase = acierto ? (10 * numeroRonda) : (5 * numeroRonda);
    }
  } else {
    if (ap === 0) {
      puntajeBase = acierto ? (10 * numeroRonda) : (-10 * numeroRonda);
    } else {
      puntajeBase = acierto ? (20 * gan) : (-10 * Math.abs(ap - gan));
    }
  }

  // 2. Bonificaciones Acumulativas (Solo si acertó su apuesta de bazas)
  if (acierto && eventosBonoConCantidad) {
    Object.keys(eventosBonoConCantidad).forEach(evId => {
      const cantidad = Number(eventosBonoConCantidad[evId]) || 0;
      if (cantidad > 0) {
        const regla = LISTA_EVENTOS_BONO.find(r => r.id === evId);
        if (regla && typeof regla.puntos === 'number') {
          totalBonos += (cantidad * regla.puntos);
        }
      }
    });
  }

  return {
    acierto,
    puntajeBase,
    totalBonos,
    puntajeTotal: puntajeBase + totalBonos
  };
}

export const calcularPuntuacionRonda = calcularPuntajeRonda;

/**
 * Bonificación progresiva por acumulación de Cartas Blancas al final del juego.
 */
export function calcularBonoComodines(cantidadCartas) {
  const c = Number(cantidadCartas) || 0;
  if (c <= 0) return 0;
  if (c === 1) return 10;
  if (c === 2) return 20;
  if (c === 3) return 50;
  return 100; // 4 o más cartas
}

export const calcularPuntuacionCartasBlancas = calcularBonoComodines;

/**
 * Procesa las Alianzas de Botín al término de la ronda.
 * Otorga +20 pts a cada aliado SOLO si AMBOS acertaron su apuesta exacta de bazas.
 */
export function procesarAlianzasBotin(listaAlianzas, listaJugadores) {
  if (!Array.isArray(listaAlianzas) || !Array.isArray(listaJugadores)) return;

  listaAlianzas.forEach(alianza => {
    const jugA = listaJugadores[alianza.idxA];
    const jugB = listaJugadores[alianza.idxB];

    if (jugA && jugB) {
      const aciertoA = Number(jugA.apuesta) === Number(jugA.ganadas);
      const aciertoB = Number(jugB.apuesta) === Number(jugB.ganadas);

      if (aciertoA && aciertoB) {
        jugA.puntos += 20;
        jugB.puntos += 20;
      }
    }
  });
}