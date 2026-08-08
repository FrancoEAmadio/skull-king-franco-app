/**
 * JS/motor/motorJugadores.js
 * Gestión de "Tarjetas de Jugadores Permanentes" guardadas en LocalStorage
 * y cálculo/actualización de sus estadísticas históricas.
 */

const CLAVE_JUGADORES_PERMANENTES = 'skullking_jugadores_permanentes';

function generarIdJugador() {
  return 'pirata_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
}

export function cargarJugadoresPermanentes() {
  const guardado = localStorage.getItem(CLAVE_JUGADORES_PERMANENTES);
  if (!guardado) return [];
  try {
    const lista = JSON.parse(guardado);
    return Array.isArray(lista) ? lista : [];
  } catch (e) {
    return [];
  }
}

export function guardarJugadoresPermanentes(listaJugadoresPermanentes) {
  localStorage.setItem(CLAVE_JUGADORES_PERMANENTES, JSON.stringify(listaJugadoresPermanentes));
}

export function crearJugadorPermanente(nombre) {
  return {
    id: generarIdJugador(),
    nombre: (nombre || 'Pirata').trim() || 'Pirata',
    estadisticas: {
      partidasJugadas: 0,
      victorias: 0,
      segundoPuesto: 0,
      tercerPuesto: 0,
      sumaPuntos: 0,
      mejorPartida: null,
      peorPartida: null,
      apuestasAcertadas: 0,
      apuestasFalladas: 0,
      capturasSkullKing: 0,
      capturasSirena: 0,
      capturasMonstruo: 0
    },
    evolucion: [] // { fecha, puntos, posicion }
  };
}

export function calcularPromedioPuntos(jugadorPermanente) {
  const est = jugadorPermanente?.estadisticas;
  if (!est || !est.partidasJugadas) return 0;
  return Math.round(est.sumaPuntos / est.partidasJugadas);
}

export function calcularPorcentajeAciertos(jugadorPermanente) {
  const est = jugadorPermanente?.estadisticas;
  if (!est) return 0;
  const total = est.apuestasAcertadas + est.apuestasFalladas;
  if (!total) return 0;
  return Math.round((est.apuestasAcertadas / total) * 100);
}

/**
 * Actualiza en el lugar las estadísticas del jugador permanente al terminar
 * una partida. datosPartida: { fecha, puntos, posicion, apuestasAcertadas,
 * apuestasFalladas, capturasSkullKing, capturasSirena, capturasMonstruo }
 */
export function actualizarEstadisticasFinPartida(jugadorPermanente, datosPartida) {
  if (!jugadorPermanente || !jugadorPermanente.estadisticas) return;
  const est = jugadorPermanente.estadisticas;

  est.partidasJugadas += 1;
  est.sumaPuntos += Number(datosPartida.puntos) || 0;

  if (datosPartida.posicion === 1) est.victorias += 1;
  else if (datosPartida.posicion === 2) est.segundoPuesto += 1;
  else if (datosPartida.posicion === 3) est.tercerPuesto += 1;

  if (est.mejorPartida === null || datosPartida.puntos > est.mejorPartida) {
    est.mejorPartida = datosPartida.puntos;
  }
  if (est.peorPartida === null || datosPartida.puntos < est.peorPartida) {
    est.peorPartida = datosPartida.puntos;
  }

  est.apuestasAcertadas += Number(datosPartida.apuestasAcertadas) || 0;
  est.apuestasFalladas += Number(datosPartida.apuestasFalladas) || 0;
  est.capturasSkullKing += Number(datosPartida.capturasSkullKing) || 0;
  est.capturasSirena += Number(datosPartida.capturasSirena) || 0;
  est.capturasMonstruo += Number(datosPartida.capturasMonstruo) || 0;

  if (!Array.isArray(jugadorPermanente.evolucion)) jugadorPermanente.evolucion = [];
  jugadorPermanente.evolucion.push({
    fecha: datosPartida.fecha,
    puntos: Number(datosPartida.puntos) || 0,
    posicion: datosPartida.posicion
  });

  // Solo conservamos las últimas 20 partidas para el gráfico de evolución
  if (jugadorPermanente.evolucion.length > 20) {
    jugadorPermanente.evolucion = jugadorPermanente.evolucion.slice(-20);
  }
}
