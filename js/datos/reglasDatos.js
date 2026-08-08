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
        titulo: "🎯 Objetivo del Juego y Dinámica de Bazas",
        texto: "INTRODUCCIÓN\nSkull King es un juego de cartas de ganar «bazas», donde el verdadero desafío no consiste en capturar la mayor cantidad posible de cartas, sino en predecir con absoluta exactitud cuántas bazas vas a ganar en cada mano.\n\nDESARROLLO DE LA PARTIDA\nUna partida estándar se compone exactamente de 10 rondas progresivas:\n• En la Ronda 1, se reparte 1 carta por jugador (1 baza en disputa).\n• En la Ronda 2, se reparten 2 cartas por jugador (2 bazas en disputa).\n• Así sucesivamente hasta la Ronda 10, donde se reparten 10 cartas y se disputan 10 bazas.\n\nDINÁMICA DE TURNO\nAl comienzo de cada ronda se baraja el mazo completo. Tras recibir sus cartas, todos los jugadores realizan su envite (apuesta de bazas). En el sentido de las agujas del reloj, cada jugador coloca una carta boca arriba en el centro de la mesa. Quien juegue la carta de mayor jerarquía gana la baza y la recoge frente a sí.",
        aberta: false
      },
      {
        titulo: "🎨 Palos y Jerarquía Básica",
        texto: "PALOS DE COLOR ESTÁNDAR (Verde, Amarillo, Violeta)\nEstán numerados del 1 al 14. Existe la obligación fundamental de asistir al palo de salida: si un jugador sale con color Verde, todos los demás deben jugar una carta Verde si tienen al menos una en su mano.\n\nPALO NEGRO / CALAVERA (El Triunfo)\nLas cartas negras numeradas del 1 al 14 representan el palo de Triunfo del juego. Una carta Negra vence a cualquier carta numérica de los otros tres colores (Verde, Amarillo o Violeta).\n\nEJEMPLO DE JERARQUÍA\n• Un 14 Verde vence a un 10 Verde.\n• Sin embargo, un simple 1 Negro (Triunfo) derrota a un 14 Verde, Amarillo o Violeta.",
        aberta: false
      },
      {
        titulo: "🃏 Cartas Especiales: Huida, Piratas, Sirenas y Skull King",
        texto: "🏳️ HUÍDA\nLa carta Huida no puede ganar una baza. Su única función es intentar evitar capturarla y dejar que otra carta determine el ganador.\n\n⚔️ PIRATAS, 🧜‍♀️ SIRENAS Y 👑 SKULL KING\nEstas tres cartas especiales tienen una jerarquía circular entre sí:\n\n• 🏴‍☠️ PIRATA derrota a 🧜‍♀️ SIRENA → +20 puntos\n• 🧜‍♀️ SIRENA derrota a 👑 SKULL KING → +40 puntos\n• 👑 SKULL KING derrota a 🏴‍☠️ PIRATA → +30 puntos\n\nLa relación funciona como un círculo: el Pirata pierde contra el Skull King, el Skull King pierde contra la Sirena y la Sirena pierde contra el Pirata.\n\n⚔️ RESOLUCIÓN ENTRE CARTAS ESPECIALES\nCuando se juegan varias de estas cartas especiales en una misma baza, una carta puede derrotar a otra según la jerarquía anterior. Las cartas especiales que resulten derrotadas dejan de competir por la baza.\n\nPor ejemplo, si se juega primero una Sirena, después un Pirata y finalmente un Skull King:\n• El Pirata derrota a la Sirena.\n• El Skull King derrota al Pirata.\n• Por lo tanto, el Skull King queda como carta ganadora.\n\nSi posteriormente se juega otra Sirena en la misma baza, esa Sirena derrota al Skull King. En ese momento la Sirena queda como vencedora.\n\nSi después se juega otro Pirata, ese Pirata derrota a la Sirena y pasa a ser la carta ganadora. La resolución continúa de esta manera mientras existan cartas especiales disponibles para jugar.\n\n🔄 EMPATE ENTRE LAS MISMAS CARTAS ESPECIALES\nAl igual que en el resto del juego, cuando se juegan dos o más cartas especiales iguales y ninguna tiene una jerarquía superior sobre la otra, gana la carta que se haya jugado primero.\n\n📌 ACLARACIÓN\nLos puntos de bonificación por captura de cartas especiales se aplican únicamente cuando corresponde según las reglas de puntuación de la partida. La captura de una carta especial no modifica por sí sola el resultado del envite.",
        aberta: false
      },
      {
        titulo: "💀 El recuento de Skull King (Sistema de Puntuación estándar)",
        texto: "APUESTA NORMAL ACERTADA (1 o más bazas)\nSi al finalizar la ronda ganaste exactamente la misma cantidad de bazas que apostaste, recibes +20 puntos por cada baza ganada.\n• Ejemplo: Si apostaste ganar 3 bazas y ganaste exactamente 3, obtienes +60 puntos (3 × 20).\n\nAPUESTA NORMAL FALLADA\nSi ganas más o menos bazas de las que envidaste, pierdes -10 puntos por cada baza de diferencia entre tu apuesta y tu resultado real.\n• Ejemplo: Si apostaste 3 bazas pero solo ganaste 1 (una diferencia de 2 bazas), pierdes -20 puntos.\n\nAPUESTA CERO (0 bazas) ACERTADA\nSi apuestas a no ganar ninguna baza en toda la ronda y cumples exitosamente tu predicción, ganas +10 puntos multiplicados por el número de la ronda actual.\n• Ejemplo: Cumplir una apuesta de 0 bazas en la Ronda 7 otorga +70 puntos.\n\nAPUESTA CERO (0 bazas) FALLADA\nSi apostaste 0 bazas pero capturas al menos 1 baza, pierdes -10 puntos multiplicados por el número de la ronda actual.\n• Ejemplo: Fallar una apuesta de 0 en la Ronda 7 resta -70 puntos.",
        aberta: false
      },
      {
        titulo: "👻 Reglas para dos jugadores",
        texto: "ADAPTACIÓN PARA DOS JUGADORES\nPara jugar a Skull King cara a cara entre dos personas, el reglamento oficial incorpora un tercer jugador neutral o, llamado Barbagrís (es el fantasma de un pirata fallecido), para mantener la tensión táctica y la impredecibilidad del juego.\n\n1. REPARTO DE CARTAS\nSe reparten tres manos completas según el número de ronda: una para cada jugador humano y una para Barba Gris. Las cartas de Barba Gris se colocan en un montón boca abajo sin mirarlas.\n\n2. DINÁMICA DEL TURNO\n• Barba Gris no realiza envites de bazas ni participa en la tabla general de puntuación.\n• El jugador que lidera o va ganando en el marcador es el responsable de dar vuelta la carta superior de Barba Gris cuando sea el turno de actuar del fantasma.\n• El fantasma juega su carta descubierta respetando siempre las reglas oficiales de asistencia de palo en la medida en que la carta revelada lo permita.\n\n3. RESOLUCIÓN DE BAZAS\nSi Barba Gris gana una baza, las cartas se apartan en su propia pila de capturas. Aunque el fantasma no sume puntos, sus victorias reducen el número de bazas disponibles en la mesa, interfiriendo de manera decisiva con las apuestas de los jugadores humanos.",
        aberta: false
      }

    ]
  },
  {
    id: "Reglas Avanzadas",
    titulo: "2. Reglas Avanzadas",
    categoria: "Base",
    items: [
      {
        titulo: "🏴‍☠️ Recuento del Bribón",
        texto: "Este sistema de puntuación es ideal para jugadores astutos y calculadores que prefieren una aventura más equilibrada.\n\nCada mano, todos los jugadores tienen los mismos puntos potenciales, al margen del número de su envite. Puedes conseguir 10 puntos por cada carta repartida en esta ronda.\n\nPor ejemplo, si se reparten 5 cartas, tu puntuación potencial es de 50 puntos, tanto si tu envite es de 0, 1, 3 o 5 bazas. Tu precisión determinará si consigues todos, parte o ninguno de esos puntos potenciales.\n\nExisten tres resultados posibles:\n\n• IMPACTO DIRECTO\nCuando logras exactamente tu envite, consigues todos los puntos potenciales de la mano.\n\n• GOLPE DE REFILON\nCuando fallas tu envite por exactamente 1 baza, ya sea por debajo o por encima, consigues la mitad de los puntos potenciales de la mano.\nPor ejemplo, si dijiste 3 y ganas 2 o 4 bazas, recibes la mitad de los puntos potenciales.\n\n• TIRO ERRADO\nCuando fallas tu envite por 2 o más bazas, no consigues ningún punto potencial.\nObtienes 0 puntos por la ronda y no se te restan puntos.\n\nEJEMPLO:\nSupongamos una ronda con 5 cartas repartidas, por lo que cada jugador tiene 50 puntos potenciales.\n\n🎯 Envite de 3 bazas\n• Ganas 3 → 50 puntos (impacto directo)\n• Ganas 2 → 25 puntos (golpe de rasguño)\n• Ganas 4 → 25 puntos (golpe de rasguño)\n• Ganas 1 → 0 puntos (tiro errado)\n• Ganas 5 → 0 puntos (tiro errado)\n\nLa cantidad de puntos potenciales depende únicamente de las cartas repartidas en la ronda, no del número de bazas apostadas.",
        abierta: false
      },
      {
        titulo: "🏴‍☠️ Recuento del Bribón — Regla opcional",
        texto: "¿Quieres más riesgo y más recompensas?\n\nPues añade este incremento al Recuento del Bribón. Inmediatamente después de realizar el envite (la apuesta), todos los jugadores eligen simultáneamente, al grito de «¡Ron, ron, ron!» (o según acuerdo en mesa), qué modalidad desean utilizar para modificar su puntuación potencial.\n\nExisten dos opciones:\n\n• METRALLA (mano abierta)\nSe utiliza la puntuación habitual del Bribón.\nSi el envite es correcto, se obtienen todos los puntos potenciales de la ronda.\nSi el envite falla exactamente por 1, se obtiene la mitad de los puntos potenciales.\nSi el envite falla por 2 o más, se obtienen 0 puntos.\n\n• BALA DE CAÑÓN (puño cerrado)\nEs una apuesta mucho más arriesgada que modifica los puntos potenciales.\nSi el envite es correcto, se obtienen 15 puntos por cada carta repartida.\nSi el envite falla, aunque sea por una sola baza, no se obtiene ningún punto por la ronda.\nNo se restan puntos; simplemente se obtienen 0 puntos.\n\nEJEMPLO:\nSupongamos una ronda con 6 cartas repartidas.\n\n✋ Metralla\n• Envite correcto: 60 puntos (6 × 10)\n• Envite fallado por 1: 30 puntos (la mitad de 60)\n• Envite fallado por 2 o más: 0 puntos\n\n✊ Bala de Cañón\n• Envite correcto: 90 puntos (6 × 15)\n• Envite fallado: 0 puntos.\n\nLa elección entre Metralla y Bala de Cañón se realiza después de anunciar el envite y antes de conocer el resultado de la ronda.",
        abierta: false
      },
      {
        titulo: "💰 Cartas de Botín",
        texto: "Cuando juegas una carta de Botín, te asocias con el jugador que la captura.\n\nSi ambos logran sus envites exactamente, reciben cada uno +20 puntos de bonificación.\n\nLa alianza se establece entre el jugador que juega el Botín y el jugador que gana la baza en la que se encuentra esa carta. Si cualquiera de los dos falla su envite, ninguno recibe la bonificación.\n\nCada carta de Botín genera una alianza independiente.",
        abierta: false
      },
      {
        titulo: "🦑 Kraken",
        texto: "Los piratas no le temen a nada, salvo al Kraken.\n\nCuando se juega el Kraken, la baza se destruye por completo, ya que el Kraken lo arrasa todo.\n\n• Nadie gana la baza.\n• Todas las cartas de esa baza se dejan a un lado.\n• La baza no cuenta como una baza ganada por ningún jugador.\n• La siguiente baza la abre el jugador que habría ganado la baza destruida.\n\nEl Kraken puede provocar que una ronda termine sin que ningún jugador gane todas las bazas disponibles. Esto debe tenerse en cuenta al registrar las bazas y al comprobar los envites.",
        abierta: false
      },
      {
        titulo: "🐋 Ballena Blanca",
        texto: "Acosada en su día por los balleneros, la Ballena Blanca se dedica ahora a dar caza a cualquier embarcación que ose cruzarse en su camino.\n\nLa Ballena Blanca afecta de formas únicas tanto a las cartas especiales como a las cartas numeradas.\n\n• CARTAS ESPECIALES\nLas cartas especiales son destruidas y no pueden ganar la baza. Esto incluye cartas como Skull King, Piratas y Sirenas.\n\n• CARTAS NUMERADAS\nLas cartas numeradas, incluidos los triunfos, pierden su palo y pasan a competir únicamente por su valor.\n\nGana la baza la carta numerada de mayor valor, independientemente de su palo. En caso de empate, gana la carta que se haya jugado primero.\n\n• SI SOLO SE JUEGAN CARTAS ESPECIALES\nSi todas las cartas jugadas son especiales y ninguna carta numerada puede ganar, la baza se descarta como ocurre con el Kraken.\n\nEn ese caso, la persona que jugó la Ballena Blanca abrirá la siguiente baza.\n\nEJEMPLO:\nCarla abre con un 2 negro. Elsa juega un Pirata. David juega un 14 amarillo. Laura juega Skull King y Carlos juega la Ballena Blanca.\n\nLas cartas especiales quedan anuladas. Las cartas numeradas pierden su color y solo se tiene en cuenta su valor. Por lo tanto, el 14 de David es la carta numerada de mayor valor y gana la baza.",
        abierta: false
      },
      {
        titulo: "🌊 Aguas Turbulentas",
        texto: "El Kraken y la Ballena Blanca son viejos rivales.\n\nCuando el Kraken y la Ballena Blanca se juegan en la misma baza, gana el que haya sido jugado en segundo lugar.\n\nLa carta que se haya jugado en segundo lugar determina la acción que debe aplicarse a la baza.",
        abierta: false
      },
    ]
  },
  {
    id: "expansion",
    titulo: "3. Expansión",
    categoria: "Expansión",
    items: [
      {
        titulo: "🃏 Cartas 7",
        texto: "FUNCIÓN Y EFECTO PENALIZADOR\nLas cartas 7 de la expansión existen para cada uno de los cuatro palos (Verde, Amarillo, Violeta y Negro/Triunfo).\n\n• Si capturas un 7 en una baza ganada, sufres una penalización de -5 puntos de bonificación por cada carta 7 capturada.\n• Regla de Oro: Esta penalización se aplica únicamente si acertaste exactamente tu envite de bazas en la ronda.",
        aberta: false
      },
      {
        titulo: "🎁 Cartas 8",
        texto: "FUNCIÓN Y EFECTO BONIFICADOR\nLas cartas 8 de la expansión existen para cada uno de los cuatro palos (Verde, Amarillo, Violeta y Negro/Triunfo).\n\n• Si capturas un 8 en una baza ganada, obtienes una bonificación especial de +5 puntos extra por cada carta 8 capturada.\n• Regla de Oro: Al igual que con otras bonificaciones, solo cobras estos puntos si cumpliste tu apuesta exacta al término de la ronda.",
        aberta: false
      },
      {
        titulo: "🔄 Cartas 0/14",
        texto: "VALOR FLEXIBLE (0 o 14)\nEstas cartas especiales existen por cada palo y ofrecen una dualidad estratégica única: al momento de jugarla en la mesa, el jugador declara en voz alta si la carta adquiere valor 0 o valor 14.\n\nREGLAS DE EMPATE Y CAPTURA\n• Si se juega como 14, adquiere la fuerza de una carta 14 de su palo, pero NO otorga la bonificación tradicional (+10 pts en palos normales o +20 pts en palo negro).\n• Si empata en valor contra un 14 estándar en la misma baza, la victoria corresponde a quien jugó su carta primero en el orden del turno.",
        aberta: false
      },
      {
        titulo: "🐒 Monito 15",
        texto: "COMODÍN NUMÉRICO SUPREMO\nEl Mono 15 representa el valor numérico más alto para los colores normales (Verde, Amarillo y Violeta).\n\nJERARQUÍA Y DEBILIDADES\n• Derrota a cualquier carta 14 de color estándar.\n• REGLA CRÍTICA: Solo puede representar los palos normales.\n\nNunca puede actuar como Palo Negro (Triunfo) y es derrotado por cualquier carta negra del 1 al 14, por Sirenas, Piratas, Primer Oficial Kong y Skull King.",
        aberta: false
      },
      {
        titulo: "🏴‍☠️ Nuevos Piratas (Mary Thorne y Primer Oficial Kong)",
        texto: "🏴‍☠️ MARY THORNE\nPirata intrépida con habilidad táctica para el siguiente turno. Al ganar una baza con Mary Thorne, el jugador elige una carta al azar de la mano de cualquier jugador (incluido él mismo) sin mirarla. Esa carta elegida queda forzada y deberá jugarse obligatoriamente en la siguiente baza, sin importar si rompe las reglas de asistencia de palo.\n\n🧤 PRIMER OFICIAL KONG\nPosee una jerarquía pirata superior.\n• Derrota a todos los números y a los Piratas estándar.\n• Pierde únicamente contra las Sirenas y el Skull King.\n• Habilidad en baza: Si gana la mano, puede copiar y utilizar todas las habilidades de los piratas que fueron capturados en esa misma baza.",
        aberta: false
      },
      {
        titulo: "🌊 Monstruos Marinos (Mantarraya Moteada y Davy Jones)",
        texto: "🐟 MANTARRAYA MOTEADA (RAYA MOTEADA)\nEs un Monstruo Marino que invierte las reglas numéricas de la baza: provoca que la carta con el número más bajo sea la ganadora indiscutida de la mano.\n\n• Si hay empates en el número menor, gana quien lo jugó primero.\n• Regla de Último Monstruo: Si en la misma baza se juegan varios monstruos marinos (Kraken, Ballena o Raya), solo tiene efecto el último monstruo jugado.\n\n👻 DAVY JONES (CAZADOR DE MONSTRUOS)\nNo compite por valor numérico para ganar bazas (vale 0 por sí mismo).\n\n• Efecto: Destruye automáticamente todos los Monstruos Marinos presentes en la baza (Kraken, Ballena Blanca y Mantarraya Moteada).\n• Bonificación: Otorga +20 puntos extra por cada monstruo marino destruido en la baza (si se cumple el envite).\n• ACLARACIÓN IMPORTANTE: Esta carta es exclusivamente un cazador de monstruos y NO genera alianzas (no confundir con Botín).",
        aberta: false
      },
      {
        titulo: "💥 Acciones Especiales (Última Descarga y Caminar por la Tabla)",
        texto: "💣 ÚLTIMA DESCARGA\nNo gana bazas y no actúa como carta de Huida. Después de que todos los jugadores hayan jugado una carta en la baza, quien jugó La Última Descarga juega inmediatamente una segunda carta desde su mano. A partir de ese momento, tendrá una carta menos en mano y se saltará automáticamente la última baza de la ronda.\n\n🪵 CAMINAR POR LA TABLA\nNo gana bazas (vale 0). Al finalizar la baza, el jugador que la utilizó elimina por completo de la mesa a un Pirata estándar que se haya jugado en esa mano, cambiando potencialmente qué otra carta o pirata resulta el verdadero ganador de la baza.",
        aberta: false
      }


    ]
  },
  {
    id: "comodines_bonificacion",
    titulo: "4. Comodines de Bonificación",
    categoria: "Avanzado",
    items: [
      {
        titulo: "🃏 Cartas Blancas (Bonificación Acumulativa)",
        texto: "MECÁNICA ESPECIAL DE LA APLICACIÓN\nLas Cartas Blancas son comodines opcionales de puntuación progresiva que no compiten durante las bazas tradicionales del juego.\n\nREPARTO Y REEMPLAZO\n• Si al recibir tu mano inicial te toca una Carta Blanca, debes revelarla inmediatamente ante todos los jugadores, apartarla boca arriba frente a ti para conservarla y robar al instante una nueva carta del mazo para completar tu mano.\n\nLÍMITE GLOBAL DE LA MESA\n• El mazo físico contiene 4 cartas en el Juego Base y 4 adicionales al activar la Expansión, estableciendo un tope máximo global estricto de 8 cartas en juego para toda la mesa.\n• Ningún jugador podrá agregar más cartas si el total de la mesa ya alcanzó el límite permitido.\n\nTABLA DE BONIFICACIÓN AL FINAL DEL JUEGO\nAl concluir la partida tras la Ronda 10, cada jugador cuenta el total de Cartas Blancas que juntó y recibe puntos extra automáticos en su puntuación final:\n• 1 carta = +5 puntos.\n• 2 cartas = +10 puntos.\n• 3 cartas = +20 puntos.\n• 4 o más cartas = +50 puntos (tope máximo de bonificación).",
        aberta: false
      }

    ]
  },
];

// Alias de compatibilidad
export const REGLAS_MANUAL_DATOS = CATEGORIAS_REGLAS_WIKI;