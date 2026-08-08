/**
 * JS/datos/modosReparto.js
 * Catálogo de Modos de Reparto de cartas: define cuántas cartas se
 * reparten a cada jugador en cada ronda, según el modo elegido en el
 * Paso 1 (Configuración de la partida).
 */

export const MODOS_REPARTO = [
  {
    id: 'clasico',
    nombre: 'Clásico',
    icono: '🟢',
    descripcion: '10 rondas: Ronda 1 con 1 carta, Ronda 2 con 2... hasta la Ronda 10 con 10.',
    cartas: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  },
  {
    id: 'sobre',
    nombre: 'Aunque Sobre',
    icono: '✉️',
    descripcion: '10 rondas: 2, 2, 4, 4, 6, 6, 8, 8, 10, 10.',
    cartas: [2, 2, 4, 4, 6, 6, 8, 8, 10, 10]
  },
  {
    id: 'remolino',
    nombre: 'Remolino',
    icono: '🌀',
    descripcion: '10 rondas: 9, 9, 7, 7, 5, 5, 3, 3, 1, 1.',
    cartas: [9, 9, 7, 7, 5, 5, 3, 3, 1, 1]
  },
  {
    id: 'directo_pelea',
    nombre: 'Directo a la Pelea',
    icono: '⚔️',
    descripcion: '5 rondas: 6, 7, 8, 9, 10.',
    cartas: [6, 7, 8, 9, 10]
  },
  {
    id: 'escaramuza',
    nombre: 'Escaramuza al Punto',
    icono: '🎯',
    descripcion: '5 rondas de 5 cartas cada una.',
    cartas: [5, 5, 5, 5, 5]
  },
  {
    id: 'andanada',
    nombre: 'Andanada Lateral',
    icono: '💥',
    descripcion: '10 rondas de 10 cartas cada una.',
    cartas: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10]
  },
  {
    id: 'tarde',
    nombre: 'Se Hace Tarde',
    icono: '🌙',
    descripcion: '1 sola ronda relámpago de 1 carta.',
    cartas: [1]
  },
  {
    id: 'personalizado',
    nombre: 'Personalizado',
    icono: '⚙️',
    descripcion: 'Editá manualmente cuántas cartas se reparten en cada una de las 10 rondas.',
    cartas: null
  }
];

/**
 * Devuelve el arreglo de cartas por ronda para el modo de reparto elegido.
 * Para 'personalizado' usa el arreglo editado a mano por el usuario.
 */
export function obtenerCartasPorRondaDelModo(idModo, cartasPersonalizadas) {
  if (idModo === 'personalizado') {
    return Array.isArray(cartasPersonalizadas) && cartasPersonalizadas.length > 0
      ? cartasPersonalizadas.slice()
      : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  }
  const modo = MODOS_REPARTO.find(m => m.id === idModo);
  return modo && modo.cartas ? modo.cartas.slice() : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
}
