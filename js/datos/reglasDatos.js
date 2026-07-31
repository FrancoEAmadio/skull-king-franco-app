/**
 * JS/datos/reglasDatos.js
 * Reglamento completo estructurado en las 5 categorías oficiales exigidas.
 * Exporta explícitamente CATEGORIAS_REGLAS_WIKI para compatibilidad con app.js e index.html.
 */

export const CATEGORIAS_REGLAS_WIKI = [
  {
    id: "general",
    titulo: "1. Reglas generales",
    categoria: "Base",
    items: [
      {
        titulo: "Objetivo del Juego y Dinámica de Bazas",
        texto: "Skull King es un juego de bazas donde los jugadores deben predecir exactamente cuántas manos (bazas) van a ganar en cada ronda. La partida consta de 10 rondas: en la ronda 1 se reparte 1 carta por jugador, en la 2 se reparten 2, y así sucesivamente hasta la ronda 10.",
        abierta: false
      },
      {
        titulo: "Palos y Jerarquía Básica",
        texto: "• Palos de Color (Verde, Amarillo, Violeta): Numerados del 1 al 14. Se debe asistir siempre al palo de salida si se tiene en la mano.\n• Palo Negro (El Triunfo): Numerados del 1 al 14. Vence a cualquier carta numérica de los otros tres colores. Un 1 Negro derrota a un 14 Verde, Amarillo o Violeta.",
        abierta: false
      },
      {
        titulo: "Cálculo de Puntuación Estándar",
        texto: "• Apuesta normal acertada: Si aciertas exactamente tu apuesta de bazas, ganas +20 puntos por cada baza apostada (ej. apostar 3 y ganar 3 = +60 pts).\n• Apuesta fallada: Si fallas tu apuesta, pierdes -10 puntos por cada baza de diferencia entre lo apostado y lo ganado.\n• Apuesta Cero (0 bazas) acertada: Ganas +10 puntos multiplicados por el número de ronda (ej. en ronda 5 = +50 pts).\n• Apuesta Cero (0 bazas) fallada: Pierdes -10 puntos multiplicados por el número de ronda.",
        abierta: false
      }
    ]
  },
  {
    id: "bribon",
    titulo: "2. Reglas del Bribón de Roatán",
    categoria: "Base",
    items: [
      {
        titulo: "Envite Adicional del Bribón",
        texto: "El pirata Bribón de Roatán permite realizar una apuesta o envite adicional de puntos al momento de jugarlo:\n• Opciones de envite: 0, 10 o 20 puntos adicionales.\n• Si aciertas tu apuesta de bazas de la ronda: Sumas los puntos apostados con el Bribón (0, +10 o +20 pts).\n• Si fallas tu apuesta de bazas: Pierdes o restas los puntos apostados con el Bribón de tu puntuación total.",
        abierta: false
      }
    ]
  },
  {
    id: "dos_jugadores",
    titulo: "3. Modo oficial para 2 jugadores",
    categoria: "Avanzado",
    items: [
      {
        titulo: "El Jugador Fantasma (Barba Azul / Barbagrís)",
        texto: "En partidas de 2 jugadores se añade una tercera mano neutral para un jugador fantasma:\n• Las cartas del jugador fantasma se colocan en un montón boca abajo sin mirarlas.\n• El jugador que lidera la baza descubre la carta superior del fantasma en su turno, jugando según las reglas de asistencia de palo.\n• El fantasma no compite en la tabla general, pero sus cartas influyen en la captura de las bazas.",
        abierta: false
      }
    ]
  },
  {
    id: "comodines_bonificacion",
    titulo: "4. Comodines de Bonificación",
    categoria: "Avanzado",
    items: [
      {
        titulo: "Cartas Blancas (Bonificación Acumulativa)",
        texto: "Las Cartas Blancas son comodines especiales que no se juegan en las bazas:\n• Al recibirlas durante el reparto, el jugador las aparta boca arriba e inmediatamente roba una carta extra del mazo para completar su mano.\n• Límite Global de la Mesa: Existen 4 cartas en el Juego Base y 4 adicionales en la Expansión (máximo global de 8 en toda la mesa).\n• Bonificación al final del juego: 1 carta = +10 pts | 2 cartas = +20 pts | 3 cartas = +50 pts | 4 o más cartas = +100 pts.",
        abierta: false
      }
    ]
  },
  {
    id: "expansion",
    titulo: "5. Expansión",
    categoria: "Expansión",
    items: [
      {
        titulo: "Nuevas Cartas Numéricas por Palo (Amarillo, Verde, Violeta y Negro)",
        texto: "• Cartas 7: Si capturas un 7 en una baza, restas -5 puntos de bonificación por cada 7 capturado (solo si aciertas tu apuesta).\n• Cartas 8: Si capturas un 8 en una baza, recibes +5 puntos de bonificación por cada 8 capturado (solo si aciertas tu apuesta).\n• Cartas 0/14: Puede declararse como valor 0 o valor 14 al jugarla. No otorga bonificación de +10 ni +20 al capturarse como 14. Si empata en valor con un 14 estándar, gana quien la jugó primero.\n• Mono 15: Comodín numérico de valor 15. Solo puede representar color Amarillo, Verde o Violeta. Nunca representa al palo Negro y pierde ante cualquier Triunfo.",
        abierta: false
      },
      {
        titulo: "Nuevos Piratas de Expansión",
        texto: "• Mary Thorne: Al ganar una baza, elige una carta al azar de la mano de cualquier jugador (incluido él mismo) sin mirarla. Esa carta debe jugarse obligatoriamente en la siguiente baza sin importar las reglas de palo.\n• Primer Oficial Con (First Mate Kong): Vence a piratas estándar pero pierde contra Sirenas y Skull King. Si gana una baza, puede utilizar todas las habilidades de los piratas capturados en esa mano.",
        abierta: false
      },
      {
        titulo: "Monstruos Marinos y Acciones Especiales",
        texto: "• Mantarraya Moteada: Monstruo marino que invierte la jerarquía: la carta numérica de menor valor gana la baza.\n• Davy Jones: No gana bazas (vale 0). Destruye todos los Monstruos Marinos de la baza y otorga +20 pts por cada monstruo destruido. (No genera alianzas).\n• Caminar por la Tabla: Elimina un pirata estándar de la baza en juego.\n• La Última Andanada: Permite jugar una segunda carta en el turno y saltarse la última baza de la ronda.\n• Alianzas de Botín: Cada carta Botín en juego genera una alianza independiente con el ganador de la baza. El bono de +20 pts solo se cobra si AMBOS jugadores aliados cumplieron su apuesta exacta.",
        abierta: false
      }
    ]
  }
];

// Alias de compatibilidad
export const REGLAS_MANUAL_DATOS = CATEGORIAS_REGLAS_WIKI;