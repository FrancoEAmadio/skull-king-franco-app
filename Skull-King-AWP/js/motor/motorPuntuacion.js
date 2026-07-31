/**
 * JS/motor/motorPuntuacion.js
 * Motor matemático de Skull King.
 * Cálculo independiente de alianzas de Botín devuelto en un mapa de puntos por índice.
 */

import { LISTA_EVENTOS_BONO } from '../datos/cartasDatos.js';

export function calcularPuntajeRonda(apuesta, ganadas, numeroRonda, eventosBonoConCantidad = {}, usarModoBribon = false, modoEnvite = 'metralla', bribonHabilidadPts = null) {
  const ap = Number(apuesta) || 0;
  const gan = Number(ganadas) || 0;
  const acierto = (ap === gan);
  let puntajeBase = 0;
  let totalBonos = 0;

  // 1. Puntuación Base o Envite del Bribón (Modo opcional Metralla / Bala de Cañón)
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

  // 2. Bonificaciones Acumulativas (Solo cobradas al acertar la apuesta de bazas)
  if (acierto && eventosBonoConCantidad) {
    Object.keys(eventosBonoConCantidad).forEach(evId => {
      // Excluimos 'alianza_botin': el Botín se evalúa exclusivamente en calcularBonosAlianzasBotin
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

  // 3. Habilidad del Pirata Bribón de Roatán (0, 10 o 20 pts SOLO si acertó su apuesta)
  if (acierto && bribonHabilidadPts !== null && bribonHabilidadPts !== undefined) {
    const ptsBribon = Number(bribonHabilidadPts);
    if (!isNaN(ptsBribon)) {
      totalBonos += ptsBribon;
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
  if (c === 1) return 10;
  if (c === 2) return 20;
  if (c === 3) return 50;
  return 100; // 4 o más cartas (tope máximo +100 pts)
}

export const calcularPuntuacionCartasBlancas = calcularBonoComodines;

/**
 * Calcula los puntos de bonificación de las Alianzas de Botín reales.
 * - Recorre las alianzas guardadas durante las bazas: [ { idxA, idxB, nombreA, nombreB }, ... ]
 * - Evalúa cada alianza de forma independiente.
 * - Otorga +20 pts a cada aliado SOLO si AMBOS acertaron su apuesta exacta de bazas.
 * - Devuelve un mapa con el total ganado por cada índice de jugador: { 0: 20, 1: 20, 2: 0 }
 */
export function calcularBonosAlianzasBotin(listaAlianzas, listaJugadores) {
  const bonosPorIndice = {};
  if (!Array.isArray(listaJugadores)) return bonosPorIndice;

  // Inicializar todos los índices en 0 puntos de Botín
  listaJugadores.forEach((_, idx) => {
    bonosPorIndice[idx] = 0;
  });

  if (!Array.isArray(listaAlianzas) || listaAlianzas.length === 0) {
    return bonosPorIndice;
  }

  // Evaluamos cada alianza individualmente (máximo 2 físicas en la ronda)
  listaAlianzas.slice(0, 2).forEach(alianza => {
    if (!alianza) return;

    // Obtención segura del índice del Jugador A
    let idxA = -1;
    if (alianza.idxA !== undefined && listaJugadores[Number(alianza.idxA)]) {
      idxA = Number(alianza.idxA);
    } else if (alianza.nombreA) {
      idxA = listaJugadores.findIndex(j => j && j.nombre === alianza.nombreA);
    }

    // Obtención segura del índice del Jugador B
    let idxB = -1;
    if (alianza.idxB !== undefined && listaJugadores[Number(alianza.idxB)]) {
      idxB = Number(alianza.idxB);
    } else if (alianza.nombreB) {
      idxB = listaJugadores.findIndex(j => j && j.nombre === alianza.nombreB);
    }

    // Validamos que sean dos jugadores existentes y distintos
    if (idxA !== -1 && idxB !== -1 && idxA !== idxB) {
      const jugA = listaJugadores[idxA];
      const jugB = listaJugadores[idxB];

      if (jugA && jugB) {
        // Verificar acierto exacto de Jugador A
        const apuestaA = Number(jugA.apuesta) || 0;
        const ganadasA = jugA.ganadas !== undefined ? Number(jugA.ganadas) : Number(jugA.bazas || 0);
        const aciertoA = (apuestaA === ganadasA);

        // Verificar acierto exacto de Jugador B
        const apuestaB = Number(jugB.apuesta) || 0;
        const ganadasB = jugB.ganadas !== undefined ? Number(jugB.ganadas) : Number(jugB.bazas || 0);
        const aciertoB = (apuestaB === ganadasB);

        // SOLO si AMBOS acertaron su apuesta, suman +20 por esta alianza
        if (aciertoA && aciertoB) {
          bonosPorIndice[idxA] = (bonosPorIndice[idxA] || 0) + 20;
          bonosPorIndice[idxB] = (bonosPorIndice[idxB] || 0) + 20;
        }
      }
    }
  });

  return bonosPorIndice;
}

// Alias de compatibilidad
export const procesarAlianzasBotin = calcularBonosAlianzasBotin;