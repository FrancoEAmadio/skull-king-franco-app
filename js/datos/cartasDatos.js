/**
 * JS/datos/cartasDatos.js
 * Catálogo de cartas ordenado por jerarquía e importancia en el juego,
 * con la carta Huida incluida y la Carta Blanca al final.
 */

export const CATALAGO_CARTAS_WIKI = [
  // 1. Skull King (1)
  {
    id: "sk",
    nombre: "Skull King (Rey Calavera)",
    modo: "Juego Base",
    cantidad: "1 carta",
    imagen: "archivos/cartas/skull_king.png",
    habilidad: "Vence a todos los piratas. Otorga +30 pts por cada pirata capturado en la baza.",
    ganaContra: "Todos los números, todos los Piratas y Primer Oficial Con (First Mate Kong)",
    pierdeContra: "Sirenas",
    bonificacion: "+30 pts por Pirata capturado",
    descripcion: "El rey de los mares. Vence a todo el mundo salvo el canto de las Sirenas."
  },
  // 2. Primer Oficial Kong (1)
  {
    id: "kong",
    nombre: "Primer Oficial Con (First Mate Kong)",
    modo: "Expansión",
    cantidad: "1 carta",
    imagen: "archivos/cartas/primer_oficial_con.png",
    habilidad: "Gana a piratas normales. Pierde contra Sirena y Skull King. Si gana una baza, puede utilizar las habilidades de todos los piratas capturados en esa misma baza.",
    ganaContra: "Todos los números y Piratas estándar",
    pierdeContra: "Sirenas y Skull King",
    bonificacion: "+30 pts si es capturado por Skull King o Sirena",
    descripcion: "Jerarquía pirata superior. Al ganar la mano se apropia de las habilidades de los piratas que derrotó."
  },
  // 3. Sirenas (2)
  {
    id: "sirena",
    nombre: "Sirenas",
    modo: "Juego Base",
    cantidad: "2 cartas",
    imagen: "archivos/cartas/sirena.png",
    habilidad: "Su canto hechiza y derrota al Skull King (+40 pts de bono).",
    ganaContra: "Todos los números, Monstruos y el Skull King",
    pierdeContra: "Cualquier Pirata (salvo el Primer Oficial Con)",
    bonificacion: "+40 pts si captura al Skull King",
    descripcion: "Hechizan al Skull King. Si un Pirata captura una Sirena, el rival se lleva +20 pts."
  },
  // 4. Piratas (7 en total)
  {
    id: "pirata_brent",
    nombre: "Bandido Bendt",
    modo: "Juego Base",
    cantidad: "1 carta",
    imagen: "archivos/cartas/pirata_bandido_bendt.png",
    habilidad: "Roba dos cartas del mazo. Luego descarta dos cartas de su mano.",
    ganaContra: "Todos los números y Sirenas",
    pierdeContra: "Skull King y Piratas jugados antes que él",
    bonificacion: "+20 pts si captura una Sirena",
    descripcion: "Permite mejorar tu mano robando dos cartas frescas y descartando dos cartas no deseadas al momento de jugarlo."
  },
  {
    id: "pirata_rascal",
    nombre: "Bribón de Roatán",
    modo: "Juego Base",
    cantidad: "1 carta",
    imagen: "archivos/cartas/pirata_bribon_de_roatan.png",
    habilidad: "Permite realizar un envite adicional: 0, 10 o 20 puntos. Si acierta su apuesta de bazas, suma esos puntos. Si falla, los pierde.",
    ganaContra: "Todos los números y Sirenas",
    pierdeContra: "Skull King y Piratas jugados antes que él",
    bonificacion: "+20 pts si captura una Sirena",
    descripcion: "El pirata astuto. Al jugarlo, puedes arriesgar puntos adicionales sobre el resultado exacto de tu ronda."
  },
  {
    id: "pirata_harry",
    nombre: "Harry el Gigante",
    modo: "Juego Base",
    cantidad: "1 carta",
    imagen: "archivos/cartas/pirata_harry_el_gigante.png",
    habilidad: "Al finalizar la ronda puede modificar su apuesta: +1, -1 o dejarla igual.",
    ganaContra: "Todos los números y Sirenas",
    pierdeContra: "Skull King y Piratas jugados antes que él",
    bonificacion: "+20 pts si captura una Sirena",
    descripcion: "Un gigante del mar que te otorga flexibilidad al final de la mano para corregir tu apuesta inicial de bazas."
  },
  {
    id: "pirata_juanita",
    nombre: "Juanita Jade",
    modo: "Juego Base",
    cantidad: "1 carta",
    imagen: "archivos/cartas/pirata_juanita_jade.png",
    habilidad: "Puede mirar las cartas no repartidas.",
    ganaContra: "Todos los números y Sirenas",
    pierdeContra: "Skull King y Piratas jugados antes que ella",
    bonificacion: "+20 pts si captura una Sirena",
    descripcion: "Te permite inspeccionar en secreto el mazo de cartas que no entraron en juego en la ronda actual."
  },
  {
    id: "pirata_rosie",
    nombre: "Rosie de Laney",
    modo: "Juego Base",
    cantidad: "1 carta",
    imagen: "archivos/cartas/pirata_rosie_de_laney.png",
    habilidad: "Elige qué jugador abrirá la siguiente baza.",
    ganaContra: "Todos los números y Sirenas",
    pierdeContra: "Skull King y Piratas jugados antes que ella",
    bonificacion: "+20 pts si captura una Sirena",
    descripcion: "Al ganar la baza con Rosie, el jugador selecciona el orden de turno y quién lidera la siguiente mano."
  },
  {
    id: "pirata_tigresa",
    nombre: "La Tigresa",
    modo: "Juego Base",
    cantidad: "1 carta",
    imagen: "archivos/cartas/pirata_tigresa.png",
    habilidad: "Al jugarla, elegís si actúa como un Pirata estándar o como una Bandera de Huida (0).",
    ganaContra: "Todos los números y Sirenas (si se juega como Pirata)",
    pierdeContra: "Skull King (o contra todas las cartas si se juega como Huida)",
    bonificacion: "+20 pts si captura una Sirena",
    descripcion: "Comodín dual que te permite atacar como Pirata o huir para evitar ganar la baza."
  },
  {
    id: "mary_thorne",
    nombre: "Mary Thorne",
    modo: "Expansión",
    cantidad: "1 carta",
    imagen: "archivos/cartas/pirata_mary_thorne.png",
    habilidad: "Al ganar una baza, el jugador elige una carta al azar de la mano de cualquier jugador, incluido él mismo, sin mirarla. La carta elegida debe jugarse obligatoriamente en la siguiente baza sin importar si rompe reglas de palo.",
    ganaContra: "Todos los números y Sirenas",
    pierdeContra: "Skull King y Piratas jugados antes que ella",
    bonificacion: "+20 pts si captura una Sirena",
    descripcion: "Pirata intrépida que te permite forzar la jugada de una carta al azar en el siguiente turno."
  },
  // 5. Palo Negro (1 al 14)
  {
    id: "palo_negro",
    nombre: "Palo Negro / Calavera (El Triunfo)",
    modo: "Juego Base",
    cantidad: "14 cartas",
    imagen: "archivos/cartas/palo_negro.png",
    habilidad: "Palo de Triunfo absoluto entre los números. El 14 Negro otorga +20 pts.",
    ganaContra: "Cualquier carta Verde, Amarilla o Violeta y Mono 15",
    pierdeContra: "Sirenas, Piratas y Skull King",
    bonificacion: "+20 pts al capturar el 14 Negro",
    descripcion: "Triunfo del juego. Un 1 Negro le gana a cualquier 14 de color estándar."
  },
  // 6. Monito 15 (1)
  {
    id: "monito15",
    nombre: "Mono 15",
    modo: "Expansión",
    cantidad: "1 carta",
    imagen: "archivos/cartas/mono_15.png",
    habilidad: "Comodín numérico de valor 15. Solo puede representar los colores amarillo, verde o violeta. Nunca representa al palo negro. Pierde contra cualquier triunfo negro.",
    ganaContra: "Cualquier carta 14 de los colores normales (Verde, Amarillo, Violeta)",
    pierdeContra: "Palo Negro (Triunfo), Sirenas, Piratas y Skull King",
    bonificacion: "Sin bono adicional",
    descripcion: "El número más alto de los colores estándar, pero indefenso ante cualquier carta de Triunfo."
  },
  // 7. Palo Amarillo (1 al 14)
  {
    id: "palo_amarillo",
    nombre: "Palo Amarillo (1 al 14)",
    modo: "Juego Base",
    cantidad: "14 cartas",
    imagen: "archivos/cartas/palo_amarillo.png",
    habilidad: "Sigue el palo de salida. El 14 Amarillo otorga +10 pts al ser capturado.",
    ganaContra: "Cartas amarillas de menor valor",
    pierdeContra: "Cartas amarillas más altas, Palo Negro, Sirenas, Piratas y Skull King",
    bonificacion: "+10 pts al capturar el 14",
    descripcion: "Palo de color estándar. Estás obligado a asistir si se sale con Amarillo."
  },
  // 8. Palo Violeta (1 al 14)
  {
    id: "palo_violeta",
    nombre: "Palo Violeta (1 al 14)",
    modo: "Juego Base",
    cantidad: "14 cartas",
    imagen: "archivos/cartas/palo_violeta.png",
    habilidad: "Sigue el palo de salida. El 14 Violeta otorga +10 pts al ser capturado.",
    ganaContra: "Cartas violetas de menor valor",
    pierdeContra: "Cartas violetas más altas, Palo Negro, Sirenas, Piratas y Skull King",
    bonificacion: "+10 pts al capturar el 14",
    descripcion: "Palo de color estándar. Estás obligado a asistir si se sale con Violeta."
  },
  // 9. Palo Verde (1 al 14)
  {
    id: "palo_verde",
    nombre: "Palo Verde (1 al 14)",
    modo: "Juego Base",
    cantidad: "14 cartas",
    imagen: "archivos/cartas/palo_verde.png",
    habilidad: "Sigue el palo de salida. El 14 Verde otorga +10 pts al ser capturado.",
    ganaContra: "Cartas verdes de menor valor",
    pierdeContra: "Cartas verdes más altas, Palo Negro, Sirenas, Piratas y Skull King",
    bonificacion: "+10 pts al capturar el 14",
    descripcion: "Palo de color estándar. Estás obligado a asistir si se sale con Verde."
  },

  // ==================== CARTAS QUE NO PUEDEN GANAR UNA BAZA ====================
  // 10. Kraken (1)
  {
    id: "kraken",
    nombre: "Kraken",
    modo: "Reglas Avanzadas",
    cantidad: "1 carta",
    imagen: "archivos/cartas/kraken.png",
    habilidad: "Monstruo Marino que destruye completamente la baza: nadie gana y nadie se lleva bonus. El jugador que jugó el Kraken lidera la siguiente baza. IMPORTANTE: Si en una misma baza se juegan varios monstruos marinos, solo se aplica el efecto del último monstruo jugado (reemplazando al anterior). Puede ser derrotado por Davy Jones.",
    ganaContra: "Destruye la baza completa",
    pierdeContra: "Davy Jones (elimina monstruos marinos) o un monstruo marino posterior",
    bonificacion: "Sin bono adicional",
    descripcion: "Monstruo supremo que anula completamente la baza en juego. Si después del Kraken se juega otro monstruo marino (Ballena Blanca o Raya Moteada), su efecto queda reemplazado por el del último monstruo jugado. Además, Davy Jones puede eliminarlo."
  },
  // 11. Ballena Blanca (1)
  {
    id: "ballena",
    nombre: "Ballena Blanca",
    modo: "Reglas Avanzadas",
    cantidad: "1 carta",
    imagen: "archivos/cartas/ballena.png",
    habilidad: "Monstruo Marino que anula todas las habilidades de las cartas especiales en la baza (Piratas, Sirenas y Skull King pierden su poder). También anula el efecto de los palos, incluido el palo negro (triunfo): todas las cartas se comparan únicamente por su valor numérico sin importar el color (gana el número más alto). Si se juegan varios monstruos marinos, solo se aplica el efecto del último.",
    ganaContra: "Anula poderes especiales y palos en la baza",
    pierdeContra: "Davy Jones (elimina monstruos marinos) o un monstruo marino posterior",
    bonificacion: "Sin bono adicional",
    descripcion: "Anula poderes especiales y colores en la baza. El color y el triunfo dejan de importar: un 13 violeta vence a un 12 negro, o un 14 amarillo vence a un 13 negro. Si luego se juega otro monstruo marino, solo se aplica el efecto del último monstruo jugado. La Ballena Blanca también puede ser eliminada por Davy Jones."
  },
  // 12. Raya Moteada (1)
  {
    id: "raya_moteada",
    nombre: "Mantarraya Moteada",
    modo: "Expansión",
    cantidad: "1 carta",
    imagen: "archivos/cartas/mantarraya_moteada.png",
    habilidad: "Monstruo Marino que invierte el orden numérico: la carta numerada más baja gana la baza. Si hay empates en el número bajo, gana quien la jugó primero. IMPORTANTE: Si aparecen varios monstruos marinos en la misma baza, únicamente tiene efecto el último monstruo jugado. Puede ser derrotada por Davy Jones.",
    ganaContra: "Hace que la carta numérica más baja gane la baza",
    pierdeContra: "Davy Jones (elimina monstruos marinos) o un monstruo marino posterior",
    bonificacion: "Sin bono adicional",
    descripcion: "Monstruo que da vuelta la jerarquía de poder haciendo que el número más bajo sea el ganador. Si se juegan múltiples monstruos marinos en la misma baza, solo se aplica el efecto del último. Además, puede ser eliminada por Davy Jones."
  },
  // 13. Davy Jones (1)
  {
    id: "davy_jones",
    nombre: "Davy Jones",
    modo: "Expansión",
    cantidad: "1 carta",
    imagen: "archivos/cartas/davy_jones.png",
    habilidad: "No gana bazas (vale 0). Destruye todos los monstruos marinos de la baza (Kraken, Ballena Blanca, Mantarraya Moteada). Otorga +20 pts por cada monstruo marino destruido en la baza.",
    ganaContra: "No gana bazas por sí mismo",
    pierdeContra: "Su función es destruir monstruos marinos",
    bonificacion: "+20 pts por cada Monstruo Marino destruido",
    descripcion: "Cazador implacable de monstruos marinos. IMPORTANTE: Esta carta no genera alianzas (no confundir con Botín)."
  },
  // 14. Caminar por el Tablón (1)
  {
    id: "tablon",
    nombre: "Caminar por la Tabla (Walk the Plank)",
    modo: "Expansión",
    cantidad: "1 carta",
    imagen: "archivos/cartas/caminar_por_la_tabla.png",
    habilidad: "No gana bazas (vale 0). Al final de la baza, elimina un pirata estándar de la baza si lo hubiere, alterando qué pirata resulta el ganador.",
    ganaContra: "No gana bazas",
    pierdeContra: "Pierde contra cualquier carta",
    bonificacion: "Sin bono adicional",
    descripcion: "Carta que condena a un pirata normal y lo expulsa de la disputa por la mano."
  },
  // 15. La Última Descarga (1)
  {
    id: "last_volley",
    nombre: "La Última Descarga",
    modo: "Expansión",
    cantidad: "1 carta",
    imagen: "archivos/cartas/canon.png",
    habilidad: "Permite jugar una segunda carta después de que todos los jugadores hayan jugado. Luego el jugador tendrá una carta menos durante el resto de la ronda y no participará en la última baza.",
    ganaContra: "No gana bazas",
    pierdeContra: "Pierde contra cualquier carta",
    bonificacion: "Sin bono adicional",
    descripcion: "Esta carta no gana una baza y no funciona como una carta de Huida. Después de que todos los jugadores hayan jugado una carta, el jugador que utilizó La Última Descarga juega inmediatamente una segunda carta. A partir de ese momento tendrá una carta menos durante el resto de la ronda y se saltará automáticamente la última baza."
  },
  // 16. Botín (2)
  {
    id: "botin",
    nombre: "Botín",
    modo: "Reglas Avanzadas",
    cantidad: "2 cartas",
    imagen: "archivos/cartas/botin.png",
    habilidad: "Vale 0 en la baza. Crea una alianza independiente entre el jugador que la juega y quien gana la baza. Si AMBOS jugadores cumplen su apuesta de bazas al final de la ronda, cobran +20 pts cada uno.",
    ganaContra: "No gana bazas (Vale 0)",
    pierdeContra: "Pierde contra cualquier carta",
    bonificacion: "+20 pts a cada aliado si ambos cumplen su apuesta",
    descripcion: "Carta de alianza pacífica entre dos jugadores. IMPORTANTE: No confundir con Davy Jones."
  },
  // 17. Huida (5)
  {
    id: "huida",
    nombre: "Huida",
    modo: "Juego Base",
    cantidad: "5 cartas",
    imagen: "archivos/cartas/huida.png",
    habilidad: "Las cinco cartas de Huida nunca pueden ganar una baza. Pierden frente a cualquier otra carta que pueda ganarla y son especialmente útiles para evitar obtener bazas no deseadas cuando el jugador intenta cumplir su apuesta.",
    ganaContra: "Ninguna carta.",
    pierdeContra: "Todas las cartas que pueden ganar una baza.",
    bonificacion: "No posee ninguna bonificación.",
    descripcion: "Las cartas de Huida representan la decisión de retirarse de una baza sin intentar ganarla. Su utilidad radica en poder descartarse de una carta sin competir por la victoria de la mano, facilitando el cumplimiento del envite realizado."
  },
  // 18. Carta Blanca (comodín de bonificación - última del catálogo)
  {
    id: "carta_blanca_base",
    nombre: "Carta Blanca (Comodín de Bonificación)",
    modo: "Reglas Avanzadas",
    cantidad: "4 cartas (o 8 con expansión)",
    imagen: "archivos/cartas/carta_blanca.png",
    habilidad: "Se aparta al recibirla durante el reparto y se roba otra carta. Suma puntos al final del juego.",
    ganaContra: "No se juega en las bazas",
    pierdeContra: "No se juega en las bazas",
    bonificacion: "1 = +10 pts | 2 = +20 pts | 3 = +50 pts | 4+ = +100 pts al final",
    descripcion: "Comodín de bonificación acumulativo. Existen 4 cartas en el Juego Base y 4 adicionales en la Expansión (límite global de 8 en toda la mesa)."
  }
];

export const LISTA_EVENTOS_BONO = [
  { id: "pirata_por_sk", etiqueta: "Pirata capturado por Skull King (+30 c/u)", puntos: 30, maximo: 7 },
  { id: "sk_por_sirena", etiqueta: "Skull King capturado por Sirena (+40 c/u)", puntos: 40, maximo: 1 },
  { id: "sirena_por_pirata", etiqueta: "Sirena capturada por Pirata (+20 c/u)", puntos: 20, maximo: 2 },
  { id: "catorce_negro", etiqueta: "14 Negro / Triunfo (+20 c/u)", puntos: 20, maximo: 1 },
  { id: "catorce_color", etiqueta: "14 de Color (+10 c/u)", puntos: 10, maximo: 3 },
  { id: "ocho_expansion", etiqueta: "8 capturado (+5 pts c/u)", puntos: 5, maximo: 4 },
  { id: "siete_expansion", etiqueta: "7 capturado (-5 pts c/u)", puntos: -5, maximo: 4 },
  { id: "alianza_botin", etiqueta: "Alianza de Botín (+20 c/u)", puntos: 20, maximo: 2 },
  { id: "monstruo_davy", etiqueta: "Monstruo destruido por Davy Jones (+20 c/u)", puntos: 20, maximo: 3 },
  { id: "kong_por_sk_sirena", etiqueta: "Primer Oficial Con capturado por SK/Sirena (+30)", puntos: 30, maximo: 1 }
];

export const CATALOGO_CARTAS_WIKI = CATALAGO_CARTAS_WIKI;