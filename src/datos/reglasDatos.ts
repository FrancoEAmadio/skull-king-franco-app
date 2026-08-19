import type { CategoriaRegla } from '../tipos';

export const CATEGORIAS_REGLAS_WIKI: CategoriaRegla[] = [
  {
    id: 'general',
    titulo: '1. Reglas generales',
    categoria: 'Base',
    items: [
      {
        titulo: '🎯 Objetivo del Juego y Dinámica de Bazas',
        texto:
          'INTRODUCCIÓN\nSkull King es un juego de cartas de ganar «bazas», donde el verdadero desafío no consiste en capturar la mayor cantidad posible de cartas, sino en predecir con absoluta exactitud cuántas bazas vas a ganar en cada mano.\n\nDESARROLLO DE LA PARTIDA\nUna partida estándar se compone exactamente de 10 rondas progresivas:\n• En la Ronda 1, se reparte 1 carta por jugador (1 baza en disputa).\n• En la Ronda 2, se reparten 2 cartas por jugador (2 bazas en disputa).\n• Así sucesivamente hasta la Ronda 10, donde se reparten 10 cartas y se disputan 10 bazas.\n\nDINÁMICA DE TURNO\nAl comienzo de cada ronda se baraja el mazo completo. Tras recibir sus cartas, todos los jugadores realizan su envite (apuesta de bazas). En el sentido de las agujas del reloj, cada jugador coloca una carta boca arriba en el centro de la mesa. Quien juegue la carta de mayor jerarquía gana la baza y la recoge frente a sí.',
        abierta: false,
      },
      {
        titulo: '🎨 Palos y Jerarquía Básica',
        texto:
          'PALOS DE COLOR ESTÁNDAR (Verde, Amarillo, Violeta)\nEstán numerados del 1 al 14. Existe la obligación fundamental de asistir al palo de salida: si un jugador sale con color Verde, todos los demás deben jugar una carta Verde si tienen al menos una en su mano.\n\nPALO NEGRO / CALAVERA (El Triunfo)\nLas cartas negras numeradas del 1 al 14 representan el palo de Triunfo del juego. Una carta Negra vence a cualquier carta numérica de los otros tres colores (Verde, Amarillo o Violeta).\n\nEJEMPLO DE JERARQUÍA\n• Un 14 Verde vence a un 10 Verde.\n• Sin embargo, un simple 1 Negro (Triunfo) derrota a un 14 Verde, Amarillo o Violeta.',
        abierta: false,
      },
      {
        titulo: '🃏 Cartas Especiales: Huida, Piratas, Sirenas y Skull King',
        texto:
          '🏳️ HUÍDA\nLa carta Huida no puede ganar una baza. Su única función es intentar evitar capturarla y dejar que otra carta determine el ganador.\n\n⚔️ PIRATAS, 🧜‍♀️ SIRENAS Y 👑 SKULL KING\nEstas tres cartas especiales tienen una jerarquía circular entre sí:\n\n• 🏴‍☠️ PIRATA derrota a 🧜‍♀️ SIRENA → +20 puntos\n• 🧜‍♀️ SIRENA derrota a 👑 SKULL KING → +40 puntos\n• 👑 SKULL KING derrota a 🏴‍☠️ PIRATA → +30 puntos\n\nLa relación funciona como un círculo: el Pirata pierde contra el Skull King, el Skull King pierde contra la Sirena y la Sirena pierde contra el Pirata.',
        abierta: false,
      },
      {
        titulo: '💀 El recuento de Skull King (Sistema de Puntuación estándar)',
        texto:
          'APUESTA NORMAL ACERTADA (1 o más bazas)\nSi al finalizar la ronda ganaste exactamente la misma cantidad de bazas que apostaste, recibes +20 puntos por cada baza ganada.\n• Ejemplo: Si apostaste ganar 3 bazas y ganaste exactamente 3, obtienes +60 puntos (3 × 20).\n\nAPUESTA NORMAL FALLADA\nSi ganas más o menos bazas de las que envidaste, pierdes -10 puntos por cada baza de diferencia entre tu apuesta y tu resultado real.\n• Ejemplo: Si apostaste 3 bazas pero solo ganaste 1 (una diferencia de 2 bazas), pierdes -20 puntos.\n\nAPUESTA CERO (0 bazas) ACERTADA\nSi apuestas a no ganar ninguna baza en toda la ronda y cumples exitosamente tu predicción, ganas +10 puntos multiplicados por el número de la ronda actual.\n• Ejemplo: Cumplir una apuesta de 0 bazas en la Ronda 7 otorga +70 puntos.\n\nAPUESTA CERO (0 bazas) FALLADA\nSi apostaste 0 bazas pero capturas al menos 1 baza, pierdes -10 puntos multiplicados por el número de la ronda actual.\n• Ejemplo: Fallar una apuesta de 0 en la Ronda 7 resta -70 puntos.',
        abierta: false,
      },
      {
        titulo: '👻 Reglas para dos jugadores',
        texto:
          'ADAPTACIÓN PARA DOS JUGADORES\nPara jugar a Skull King cara a cara entre dos personas, el reglamento oficial incorpora un tercer jugador neutral llamado Barbagrís (el fantasma de un pirata fallecido), para mantener la tensión táctica y la impredecibilidad del juego.\n\n1. REPARTO DE CARTAS\nSe reparten tres manos completas según el número de ronda: una para cada jugador humano y una para Barba Gris. Las cartas de Barba Gris se colocan en un montón boca abajo sin mirarlas.\n\n2. DINÁMICA DEL TURNO\n• Barba Gris no realiza envites de bazas ni participa en la tabla general de puntuación.\n• El jugador que lidera o va ganando en el marcador es el responsable de dar vuelta la carta superior de Barba Gris cuando sea el turno de actuar del fantasma.\n\n3. RESOLUCIÓN DE BAZAS\nSi Barba Gris gana una baza, las cartas se apartan en su propia pila de capturas. Aunque el fantasma no sume puntos, sus victorias reducen el número de bazas disponibles en la mesa.',
        abierta: false,
      },
    ],
  },
  {
    id: 'reglas_avanzadas',
    titulo: '2. Reglas Avanzadas',
    categoria: 'Base',
    items: [
      {
        titulo: '🏴‍☠️ Recuento del Bribón',
        texto:
          'Este sistema de puntuación es ideal para jugadores astutos y calculadores que prefieren una aventura más equilibrada.\n\nCada mano, todos los jugadores tienen los mismos puntos potenciales, al margen del número de su envite. Puedes conseguir 10 puntos por cada carta repartida en esta ronda.\n\nExisten tres resultados posibles:\n\n• IMPACTO DIRECTO: cuando logras exactamente tu envite, consigues todos los puntos potenciales de la mano.\n• GOLPE DE REFILÓN: cuando fallas tu envite por exactamente 1 baza, consigues la mitad de los puntos potenciales.\n• TIRO ERRADO: cuando fallas tu envite por 2 o más bazas, no consigues ningún punto potencial.',
        abierta: false,
      },
      {
        titulo: '🏴‍☠️ Recuento del Bribón — Regla opcional',
        texto:
          'Inmediatamente después del envite, todos los jugadores eligen simultáneamente qué modalidad utilizar.\n\n• METRALLA (mano abierta): puntuación habitual del Bribón. Envite correcto = todos los puntos, envite fallado por 1 = la mitad, envite fallado por 2 o más = 0 puntos.\n\n• BALA DE CAÑÓN (puño cerrado): más arriesgada. Envite correcto = 15 puntos por cada carta repartida. Envite fallado por cualquier margen = 0 puntos (sin restar).',
        abierta: false,
      },
      {
        titulo: '💰 Cartas de Botín',
        texto:
          'Cuando juegas una carta de Botín, te asocias con el jugador que la captura. Si ambos logran sus envites exactamente, reciben cada uno +20 puntos de bonificación. Cada carta de Botín genera una alianza independiente.',
        abierta: false,
      },
      {
        titulo: '🦑 Kraken',
        texto:
          'Los piratas no le temen a nada, salvo al Kraken. Cuando se juega el Kraken, la baza se destruye por completo: nadie la gana y todas las cartas se dejan a un lado. La siguiente baza la abre el jugador que habría ganado la baza destruida.',
        abierta: false,
      },
      {
        titulo: '🐋 Ballena Blanca',
        texto:
          'La Ballena Blanca afecta de formas únicas tanto a las cartas especiales como a las cartas numeradas.\n\n• CARTAS ESPECIALES: son destruidas y no pueden ganar la baza.\n• CARTAS NUMERADAS: pierden su palo y pasan a competir únicamente por su valor. Gana la carta numerada de mayor valor.\n• SI SOLO SE JUEGAN CARTAS ESPECIALES: la baza se descarta como con el Kraken.',
        abierta: false,
      },
      {
        titulo: '🌊 Aguas Turbulentas',
        texto:
          'Cuando el Kraken y la Ballena Blanca se juegan en la misma baza, gana el que haya sido jugado en segundo lugar.',
        abierta: false,
      },
    ],
  },
  {
    id: 'expansion',
    titulo: '3. Expansión',
    categoria: 'Expansión',
    items: [
      {
        titulo: '🃏 Cartas 7',
        texto:
          'Las cartas 7 existen para cada uno de los cuatro palos. Si capturas un 7 en una baza ganada, sufres una penalización de -5 puntos por cada carta 7 capturada. Solo se aplica si acertaste exactamente tu envite.',
        abierta: false,
      },
      {
        titulo: '🎁 Cartas 8',
        texto:
          'Las cartas 8 existen para cada uno de los cuatro palos. Si capturas un 8 en una baza ganada, obtienes +5 puntos por cada 8 capturado. Solo se cobra si cumpliste tu apuesta exacta al término de la ronda.',
        abierta: false,
      },
      {
        titulo: '🔄 Cartas 0/14',
        texto:
          'Al momento de jugarla, el jugador declara si la carta adquiere valor 0 o valor 14. Si se juega como 14, adquiere la fuerza de un 14 de su palo pero NO otorga la bonificación tradicional. En empate contra un 14 estándar, gana quien la haya jugado primero.',
        abierta: false,
      },
      {
        titulo: '🐒 Monito 15',
        texto:
          'El Mono 15 es el valor numérico más alto para los colores normales. Derrota a cualquier 14 de color estándar, pero pierde contra cualquier carta negra, Sirenas, Piratas, Primer Oficial Kong y Skull King.',
        abierta: false,
      },
      {
        titulo: '🏴‍☠️ Nuevos Piratas (Mary Thorne y Primer Oficial Kong)',
        texto:
          '🏴‍☠️ MARY THORNE: al ganar una baza, elige una carta al azar de la mano de cualquier jugador. Esa carta queda forzada y deberá jugarse obligatoriamente en la siguiente baza.\n\n🧤 PRIMER OFICIAL KONG: derrota a todos los números y Piratas estándar. Pierde contra Sirenas y Skull King. Si gana una baza, copia todas las habilidades de los piratas capturados.',
        abierta: false,
      },
      {
        titulo: '🌊 Monstruos Marinos (Mantarraya y Davy Jones)',
        texto:
          '🐟 MANTARRAYA MOTEADA: invierte las reglas numéricas. Gana la carta con el número más bajo.\n\n👻 DAVY JONES: no gana bazas por valor. Destruye automáticamente todos los Monstruos Marinos de la baza y otorga +20 pts por cada monstruo destruido.',
        abierta: false,
      },
      {
        titulo: '💥 Acciones Especiales',
        texto:
          '💣 ÚLTIMA DESCARGA: después de que todos hayan jugado, quien la usó juega inmediatamente una segunda carta y se salta la última baza.\n\n🪵 CAMINAR POR LA TABLA: al finalizar la baza, elimina por completo a un Pirata estándar de la mesa, cambiando potencialmente al ganador.',
        abierta: false,
      },
    ],
  },
  {
    id: 'comodines_bonificacion',
    titulo: '4. Comodines de Bonificación',
    categoria: 'Avanzado',
    items: [
      {
        titulo: '🃏 Cartas Blancas (Bonificación Acumulativa)',
        texto:
          'Si al recibir tu mano inicial te toca una Carta Blanca, la apartás boca arriba y robás una nueva carta.\n\nLímite global de mesa: 4 en Juego Base, 8 con Expansión.\n\nAl final de la partida:\n• 1 carta = +5 pts\n• 2 cartas = +10 pts\n• 3 cartas = +20 pts\n• 4 o más = +50 pts (tope)',
        abierta: false,
      },
    ],
  },
];
