/**
 * JS/motor/motorPuntuacion.js
 * Motor matemático de Skull King.
 * Cálculo independiente de alianzas de Botín y apuestas de puntos del Bribón de Roatán.
 */

import { LISTA_EVENTOS_BONO } from '../datos/cartasDatos.js';

export function calcularPuntajeRonda(
  apuesta,
  ganadas,
  numeroRonda,
  eventosBonoConCantidad = {},
  usarModoBribon = false,
  modoEnvite = 'metralla',
  bribonHabilidadPts = null,
  cobrarBonosSinAcierto = false
) {
  const ap = Number(apuesta) || 0;
  const gan = Number(ganadas) || 0;
  const acierto = (ap === gan);
  let puntajeBase = 0;
  let totalBonos = 0;

  // 1. Puntuación Base o Modo Bribón Opcional (Metralla / Bala de Cañón)
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

  // 2. Bonificaciones Acumulativas Normales
  // Se cobran si acertó el envite O si la regla de mesa permite cobrar bonos sin acierto
  const puedeCobrarBonos = acierto || cobrarBonosSinAcierto;

  if (puedeCobrarBonos && eventosBonoConCantidad) {
    Object.keys(eventosBonoConCantidad).forEach(evId => {
      if (evId === 'alianza_botin') return;

      const cantidad = Number(eventosBonoConCantidad[evId]) || 0;
      if (cantidad > 0) {
        const regla = LISTA_EVENTOS_BONO.find(r => r.id === evId);
        if (regla && typeof regla.puntos === 'number') {
          totalBonos += (cantidad * regla.puntos);
        }
      }
    });
  }

  // 3. Habilidad del Pirata Bribón de Roatán (Apuesta de puntos: suma si acierta, RESTA si falla)
  if (bribonHabilidadPts !== null && bribonHabilidadPts !== undefined) {
    const ptsBribon = Number(bribonHabilidadPts);
    if (!isNaN(ptsBribon) && ptsBribon > 0) {
      if (acierto) {
        totalBonos += ptsBribon;
      } else {
        totalBonos -= ptsBribon; // Penalización por fallar la apuesta de puntos
      }
    }
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
  if (c === 1) return 5;
  if (c === 2) return 10;
  if (c === 3) return 20;
  return 50;
}

export const calcularPuntuacionCartasBlancas = calcularBonoComodines;

/**
 * Calcula los puntos de bonificación de las Alianzas de Botín reales.
 * Otorga +20 pts a cada aliado SOLO si AMBOS acertaron su apuesta exacta de bazas.
 */
export function calcularBonosAlianzasBotin(listaAlianzas, listaJugadores) {
  const bonosPorIndice = {};
  if (!Array.isArray(listaJugadores)) return bonosPorIndice;

  listaJugadores.forEach((_, idx) => {
    bonosPorIndice[idx] = 0;
  });

  if (!Array.isArray(listaAlianzas) || listaAlianzas.length === 0) {
    return bonosPorIndice;
  }

  listaAlianzas.slice(0, 2).forEach(alianza => {
    if (!alianza) return;

    let idxA = -1;
    if (alianza.idxA !== undefined && listaJugadores[Number(alianza.idxA)]) {
      idxA = Number(alianza.idxA);
    } else if (alianza.nombreA) {
      idxA = listaJugadores.findIndex(j => j && j.nombre === alianza.nombreA);
    }

    let idxB = -1;
    if (alianza.idxB !== undefined && listaJugadores[Number(alianza.idxB)]) {
      idxB = Number(alianza.idxB);
    } else if (alianza.nombreB) {
      idxB = listaJugadores.findIndex(j => j && j.nombre === alianza.nombreB);
    }

    if (idxA !== -1 && idxB !== -1 && idxA !== idxB) {
      const jugA = listaJugadores[idxA];
      const jugB = listaJugadores[idxB];

      if (jugA && jugB) {
        const apuestaA = Number(jugA.apuesta) || 0;
        const ganadasA = Number(jugA.ganadas) || 0;
        const aciertoA = (apuestaA === ganadasA);

        const apuestaB = Number(jugB.apuesta) || 0;
        const ganadasB = Number(jugB.ganadas) || 0;
        const aciertoB = (apuestaB === ganadasB);

        if (aciertoA && aciertoB) {
          bonosPorIndice[idxA] = (bonosPorIndice[idxA] || 0) + 20;
          bonosPorIndice[idxB] = (bonosPorIndice[idxB] || 0) + 20;
        }
      }
    }
  });

  return bonosPorIndice;
}

export const procesarAlianzasBotin = calcularBonosAlianzasBotin;