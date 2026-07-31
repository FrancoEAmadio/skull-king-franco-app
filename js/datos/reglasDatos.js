/**
 * JS/datos/reglasDatos.js
 * Manual interactivo y enciclopedia oficial de Skull King.
 * Presentación mejorada con párrafos, subtítulos, ejemplos y sin resúmenes.
 */

export const CATEGORIAS_REGLAS_WIKI = [
  {
    id: "general",
    titulo: "1. Reglas generales",
    categoria: "Base",
    items: [
      {
        titulo: "Objetivo del Juego y Dinámica de Bazas",
        texto: "INTRODUCCIÓN\nSkull King es un juego de cartas de ganar «bazas», donde el verdadero desafío no consiste en capturar la mayor cantidad posible de cartas, sino en predecir con absoluta exactitud cuántas bazas vas a ganar en cada mano.\n\nDESARROLLO DE LA PARTIDA\nUna partida estándar se compone exactamente de 10 rondas progresivas:\n• En la Ronda 1, se reparte 1 carta por jugador (1 baza en disputa).\n• En la Ronda 2, se reparten 2 cartas por jugador (2 bazas en disputa).\n• Así sucesivamente hasta la Ronda 10, donde se reparten 10 cartas y se disputan 10 bazas.\n\nDINÁMICA DE TURNO\nAl comienzo de cada ronda se baraja el mazo completo. Tras recibir sus cartas, todos los jugadores realizan su envite (apuesta de bazas). En el sentido de las agujas del reloj, cada jugador coloca una carta boca arriba en el centro de la mesa. Quien juegue la carta de mayor jerarquía gana la baza y la recoge frente a sí.",
        abierta: false
      },
      {
        titulo: "Palos y Jerarquía Básica",
        texto: "PALOS DE COLOR ESTÁNDAR (Verde, Amarillo, Violeta)\nEstán numerados del 1 al 14. Existe la obligación fundamental de asistir al palo de salida: si un jugador sale con color Verde, todos los demás deben jugar una carta Verde si tienen al menos una en su mano.\n\nPALO NEGRO / CALAVERA (El Triunfo)\nLas cartas negras numeradas del 1 al 14 representan el palo de Triunfo del juego. Una carta Negra vence a cualquier carta numérica de los otros tres colores (Verde, Amarillo o Violeta).\n\nEJEMPLO DE JERARQUÍA\n• Un 14 Verde vence a un 10 Verde.\n• Sin embargo, un simple 1 Negro (Triunfo) derrota a un 14 Verde, Amarillo o Violeta.",
        abierta: false
      },
      {
        titulo: "Cálculo de Puntuación Estándar",
        texto: "APUESTA NORMAL ACERTADA (1 o más bazas)\nSi al finalizar la ronda ganaste exactamente la misma cantidad de bazas que apostaste, recibes +20 puntos por cada baza ganada.\n• Ejemplo: Si apostaste ganar 3 bazas y ganaste exactamente 3, obtienes +60 puntos (3 × 20).\n\nAPUESTA NORMAL FALLADA\nSi ganas más o menos bazas de las que envidaste, pierdes -10 puntos por cada baza de diferencia entre tu apuesta y tu resultado real.\n• Ejemplo: Si apostaste 3 bazas pero solo ganaste 1 (una diferencia de 2 bazas), pierdes -20 puntos.\n\nAPUESTA CERO (0 bazas) ACERTADA\nSi apuestas a no ganar ninguna baza en toda la ronda y cumples exitosamente tu predicción, ganas +10 puntos multiplicados por el número de la ronda actual.\n• Ejemplo: Cumplir una apuesta de 0 bazas en la Ronda 7 otorga +70 puntos.\n\nAPUESTA CERO (0 bazas) FALLADA\nSi apostaste 0 bazas pero capturas al menos 1 baza, pierdes -10 puntos multiplicados por el número de la ronda actual.\n• Ejemplo: Fallar una apuesta de 0 en la Ronda 7 resta -70 puntos.",
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
        titulo: "🏴‍☠️ Reglas del Bribón (Opcionales – Envite Especial)",
        texto: "¿Quieres más riesgo y más recompensas?\n\nInmediatamente después de realizar el envite (la apuesta), todos los jugadores eligen simultáneamente, al grito de «¡Ron! ¡Ron! ¡Ron!», cómo desean puntuar esa ronda.\n\nExisten dos opciones:\n\n• METRALLA (mano abierta)\nSe utiliza la puntuación habitual del Bribón.\nSi el envite es correcto, se obtienen 10 puntos por cada carta repartida.\nSi el envite falla, incluso por una sola baza, igualmente se obtienen 5 puntos por cada carta repartida.\n\n• BALA DE CAÑÓN (puño cerrado)\nEs una apuesta mucho más arriesgada.\nSi el envite es correcto, se obtienen 15 puntos por cada carta repartida.\nSi el envite falla, aunque sea por una sola baza, no se obtiene ningún punto por la ronda.\nNo se restan puntos; simplemente se obtienen 0 puntos.\n\nEJEMPLO OFICIAL:\nSupongamos una ronda con 6 cartas repartidas y un envite de 3 bazas.\n\n✋ Metralla\n• Envite correcto: 60 puntos (6 × 10)\n• Envite fallado: 30 puntos (6 × 5)\n\n✊ Bala de Cañón\n• Envite correcto: 90 puntos (6 × 15)\n• Envite fallado: 0 puntos.",
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
        texto: "ADAPTACIÓN PARA DOS JUGADORES\nPara jugar a Skull King cara a cara entre dos personas, el reglamento oficial incorpora un tercer jugador neutral o «Jugador Fantasma», habitualmente llamado Barba Azul o Barbagrís, para mantener la tensión táctica y la impredecibilidad del juego.\n\n1. REPARTO DE CARTAS\nSe reparten tres manos completas según el número de ronda: una para cada jugador humano y una para Barba Azul. Las cartas de Barba Azul se colocan en un montón boca abajo sin mirarlas.\n\n2. DINÁMICA DEL TURNO\n• Barba Azul no realiza envites de bazas ni participa en la tabla general de puntuación.\n• El jugador que lidera o va ganando en el marcador es el responsable de dar vuelta la carta superior de Barba Azul cuando sea el turno de actuar del fantasma.\n• El fantasma juega su carta descubierta respetando siempre las reglas oficiales de asistencia de palo en la medida en que la carta revelada lo permita.\n\n3. RESOLUCIÓN DE BAZAS\nSi Barba Azul gana una baza, las cartas se apartan en su propia pila de capturas. Aunque el fantasma no sume puntos, sus victorias reducen el número de bazas disponibles en la mesa, interfiriendo de manera decisiva con las apuestas de los jugadores humanos.",
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
        texto: "MECÁNICA ESPECIAL DE LA APLICACIÓN\nLas Cartas Blancas son comodines opcionales de puntuación progresiva que no compiten durante las bazas tradicionales del juego.\n\nREPARTO Y REEMPLAZO\n• Si al recibir tu mano inicial te toca una Carta Blanca, debes revelarla inmediatamente ante todos los jugadores, apartarla boca arriba frente a ti para conservarla y robar al instante una nueva carta del mazo para completar tu mano.\n\nLÍMITE GLOBAL DE LA MESA\n• El mazo físico contiene 4 cartas en el Juego Base y 4 adicionales al activar la Expansión, estableciendo un tope máximo global estricto de 8 cartas en juego para toda la mesa.\n• Ningún jugador podrá agregar más cartas si el total de la mesa ya alcanzó el límite permitido.\n\nTABLA DE BONIFICACIÓN AL FINAL DEL JUEGO\nAl concluir la partida tras la Ronda 10, cada jugador cuenta el total de Cartas Blancas que juntó y recibe puntos extra automáticos en su puntuación final:\n• 1 carta = +10 puntos.\n• 2 cartas = +20 puntos.\n• 3 cartas = +50 puntos.\n• 4 o más cartas = +100 puntos (tope máximo de bonificación).",
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
        titulo: "Cartas 7",
        texto: "FUNCIÓN Y EFECTO PENALIZADOR\nLas cartas 7 de la expansión existen para cada uno de los cuatro palos (Verde, Amarillo, Violeta y Negro/Triunfo).\n\n• Si capturas un 7 en una baza ganada, sufres una penalización de -5 puntos de bonificación por cada carta 7 capturada.\n• Regla de Oro: Esta penalización se aplica únicamente si acertaste exactamente tu envite de bazas en la ronda.",
        abierta: false
      },
      {
        titulo: "Cartas 8",
        texto: "FUNCIÓN Y EFECTO BONIFICADOR\nLas cartas 8 de la expansión existen para cada uno de los cuatro palos (Verde, Amarillo, Violeta y Negro/Triunfo).\n\n• Si capturas un 8 en una baza ganada, obtienes una bonificación especial de +5 puntos extra por cada carta 8 capturada.\n• Regla de Oro: Al igual que con otras bonificaciones, solo cobras estos puntos si cumpliste tu apuesta exacta al término de la ronda.",
        abierta: false
      },
      {
        titulo: "Cartas 0/14",
        texto: "VALOR FLEXIBLE (0 o 14)\nEstas cartas especiales existen por cada palo y ofrecen una dualidad estratégica única: al momento de jugarla en la mesa, el jugador declara en voz alta si la carta adquiere valor 0 o valor 14.\n\nREGLAS DE EMPATE Y CAPTURA\n• Si se juega como 14, adquiere la fuerza de una carta 14 de su palo, pero NO otorga la bonificación tradicional (+10 pts en palos normales o +20 pts en palo negro).\n• Si empata en valor contra un 14 estándar en la misma baza, la victoria corresponde a quien jugó su carta primero en el orden del turno.",
        abierta: false
      },
      {
        titulo: "Monito 15",
        texto: "COMODÍN NUMÉRICO SUPREMO\nEl Mono 15 representa el valor numérico más alto para los colores normales (Verde, Amarillo y Violeta).\n\nJERARQUÍA Y DEBILIDADES\n• Derrota a cualquier carta 14 de color estándar.\n• REGLA CRÍTICA: Solo puede representar los palos normales. Nunca puede actuar como Palo Negro (Triunfo) y es derrotado por cualquier carta negra del 1 al 14, por Sirenas, Piratas y Skull King.",
        abierta: false
      },
      {
        titulo: "Nuevos Piratas (Mary Thorne y Primer Oficial Kong)",
        texto: "MARY THORNE\nPirata intrépida con habilidad táctica para el siguiente turno. Al ganar una baza con Mary Thorne, el jugador elige una carta al azar de la mano de cualquier jugador (incluido él mismo) sin mirarla. Esa carta elegida queda forzada y deberá jugarse obligatoriamente en la siguiente baza, sin importar si rompe las reglas de asistencia de palo.\n\nPRIMER OFICIAL CON (FIRST MATE KONG)\nPosee una jerarquía pirata superior.\n• Derrota a todos los números y a los Piratas estándar.\n• Pierde únicamente contra las Sirenas y el Skull King.\n• Habilidad en baza: Si gana la mano, puede copiar y utilizar todas las habilidades de los piratas que fueron capturados en esa misma baza.",
        abierta: false
      },
      {
        titulo: "Monstruos Marinos (Mantarraya Moteada y Davy Jones)",
        texto: "MANTARRAYA MOTEADA (RAYA MOTEADA)\nEs un Monstruo Marino que invierte las reglas numéricas de la baza: provoca que la carta con el número más bajo sea la ganadora indiscutida de la mano.\n• Si hay empates en el número menor, gana quien lo jugó primero.\n• Regla de Último Monstruo: Si en la misma baza se juegan varios monstruos marinos (Kraken, Ballena o Raya), solo tiene efecto el último monstruo jugado.\n\nDAVY JONES (CAZADOR DE MONSTRUOS)\nNo compite por valor numérico para ganar bazas (vale 0 por sí mismo).\n• Efecto: Destruye automáticamente todos los Monstruos Marinos presentes en la baza (Kraken, Ballena Blanca y Mantarraya Moteada).\n• Bonificación: Otorga +20 puntos extra por cada monstruo marino destruido en la baza (si se cumple el envite).\n• ACLARACIÓN IMPORTANTE: Esta carta es exclusivamente un cazador de monstruos y NO genera alianzas (no confundir con Botín).",
        abierta: false
      },
      {
        titulo: "Acciones Especiales (Última Descarga, Caminar por el Tablón y Alianzas de Botín)",
        texto: "LA ÚLTIMA DESCARGA (THE LAST VOLLEY)\nNo gana bazas y no actúa como carta de Huida. Después de que todos los jugadores hayan jugado una carta en la baza, quien jugó La Última Descarga juega inmediatamente una segunda carta desde su mano. A partir de ese momento, tendrá una carta menos en mano y se saltará automáticamente la última baza de la ronda.\n\nCAMINAR POR LA TABLA (WALK THE PLANK)\nNo gana bazas (vale 0). Al finalizar la baza, el jugador que la utilizó elimina por completo de la mesa a un Pirata estándar que se haya jugado en esa mano, cambiando potencialmente qué otra carta o pirata resulta el verdadero ganador de la baza.\n\nALIANZAS DE BOTÍN\nCada carta Botín en juego genera una alianza pacífica e independiente entre el jugador que la puso en juego y el jugador que se llevó la baza.\n• Bonificación: +20 puntos para cada aliado.\n• Condición estricta: El bono solo se cobra si AMBOS miembros de la alianza cumplieron con exactitud su apuesta de bazas al final de la ronda; si uno de los dos falla, ninguno recibe puntos.\n• Límites en mesa: Máximo 2 cartas Botín por jugador y hasta 4 cartas en disputa en una misma ronda.",
        abierta: false
      }
    ]
  }
];

// Alias de compatibilidad
export const REGLAS_MANUAL_DATOS = CATEGORIAS_REGLAS_WIKI;