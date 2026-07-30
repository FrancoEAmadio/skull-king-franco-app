/**
 * js/engine/scoreEngine.js
 * Motor matemático de Skull King (Soporta acumulación por cantidad y Modo Bribón Opcional)
 */

import { LISTA_EVENTOS_BONO } from '../data/cartasData.js';

export function calcularPuntajeRonda(apuesta, ganadas, numeroRonda, eventosBonoConCantidad = {}, usarModoBribon = false, modoEnvite = 'metralla') {
  const ap = Number(apuesta) || 0;
  const gan = Number(ganadas) || 0;
  const acierto = (ap === gan);
  let puntajeBase = 0;
  let totalBonos = 0;

  // 1. Puntuación Base o Reglas del Bribón Opcionales
  if (usarModoBribon) {
    // RECUENTO DEL BRIBÓN OPCIONAL (Pág. 20)
    if (modoEnvite === 'bala') {
      // Bala de cañón (Puño cerrado): 15 pts por carta repartida si acierta, 0 pts si falla
      puntajeBase = acierto ? (15 * numeroRonda) : 0;
    } else {
      // Metralla (Mano abierta - Bribón habitual): 10 pts x ronda si acierta, 5 pts x ronda si falla
      puntajeBase = acierto ? (10 * numeroRonda) : (5 * numeroRonda);
    }
  } else {
    // PUNTUACIÓN CLÁSICA ESTÁNDAR
    if (ap === 0) {
      puntajeBase = acierto ? (10 * numeroRonda) : (-10 * numeroRonda);
    } else {
      puntajeBase = acierto ? (20 * gan) : (-10 * Math.abs(ap - gan));
    }
  }

  // 2. Bonificaciones Acumulativas (Solo si el envite es correcto)
  if (acierto && eventosBonoConCantidad) {
    Object.keys(eventosBonoConCantidad).forEach(evId => {
      const cantidad = Number(eventosBonoConCantidad[evId]) || 0;
      if (cantidad > 0) {
        const regla = LISTA_EVENTOS_BONO.find(r => r.id === evId);
        if (regla) {
          totalBonos += regla.puntos * cantidad;
        }
      }
    });
  }

  return {
    puntajeBase,
    totalBonos,
    puntajeTotal: puntajeBase + totalBonos,
    acierto
  };
}

export function calcularBonoReglaFranco(cantidadCartasBlancas) {
  const cant = Number(cantidadCartasBlancas) || 0;
  if (cant <= 0) return 0;
  if (cant === 1) return 10;
  if (cant === 2) return 20;
  if (cant === 3) return 50;
  return 100; // 4 o más
}