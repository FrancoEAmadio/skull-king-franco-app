/**
 * js/data/cartasData.js
 * Catálogo de cartas con cantidades exactas de la caja y nombres oficiales en español.
 */

export const CARTAS_POR_GRUPO = {
  palos: [
    {
      id: "colores",
      nombre: "Palos de Color: Verde, Amarillo y Violeta (1 al 14 - 14 cartas de cada color, 42 en total)",
      imagen: [
        "archivos/cartas/palo_verde.png",
        "archivos/cartas/palo_amarillo.png",
        "archivos/cartas/palo_violeta.png"
      ],
      descripcion: "Estás obligado a seguir el palo de salida si tenés cartas de ese color. Los 14 de color otorgan +10 puntos de bonificación al capturarlos. Expansión: Los 8 suman +5 pts, los 7 restan -5 pts, y los 0/14 duales se declaran al jugarse."
    },
    {
      id: "monito15",
      nombre: "El Monito 15 (1 carta)",
      imagen: "archivos/cartas/mono.png",
      descripcion: "Comodín numérico sin palo. Le gana a las cartas 14 de los colores normales, pero pierde contra el palo Negro (Triunfo), Sirenas, Piratas y Skull King."
    },
    {
      id: "negro",
      nombre: "Palo Negro / Calavera: El Triunfo (1 al 14 - 14 cartas)",
      imagen: "archivos/cartas/palo_negro.png",
      descripcion: "Es el palo de triunfo absoluto de los números. Un 1 Negro vence a un 14 de color y al Monito 15. El 14 Negro otorga +20 puntos de bonificación."
    }
  ],
  especiales: [
    {
      id: "sirena",
      nombre: "Sirenas (2 cartas)",
      imagen: "archivos/cartas/sirena.png",
      descripcion: "Derrotan a todos los números. ¡Su canto hechiza y vence al Skull King (+40 pts de bono)! Pierden siempre contra cualquier Pirata (excepto Kon)."
    },
    {
      id: "sk",
      nombre: "Skull King - Rey Calavera (1 carta)",
      imagen: "archivos/cartas/skull_king.png",
      descripcion: "Derrota a todos los números y vence a todos los Piratas y a Kon (+30 pts de bono por cada uno capturado). Única debilidad: Pierde contra las Sirenas."
    },
    {
      id: "kong",
      nombre: "Primer Oficial Kon - Súper Pirata (1 carta)",
      imagen: "archivos/cartas/kong.png",
      descripcion: "Gana como pirata normal y absorbe/copia las habilidades de los piratas que derrotó en esa baza. A diferencia de los piratas comunes, ES DERROTADO POR LAS SIRENAS. Pierde ante el Skull King."
    }
  ],
  piratasLista: [
    {
      nombre: "Rascal - El Trilerito (1 carta)",
      imagen: "archivos/cartas/pirata_rascal.png",
      habilidad: "Te permite cambiar tu apuesta de bazas en +1 o -1 en cualquier momento de la ronda."
    },
    {
      nombre: "Rosie (La Bendita) (1 carta)",
      imagen: "archivos/cartas/pirata_bendita.png",
      habilidad: "Podés apostar +10 o +20 pts extra a que acertás tu apuesta exacta en la ronda."
    },
    {
      nombre: "Harry el Gigante (1 carta)",
      imagen: "archivos/cartas/pirata_harry.png",
      habilidad: "En reglas avanzadas permite elegir quién lidera y sale en la siguiente baza."
    },
    {
      nombre: "Juanita - Ojo de Halcón (1 carta)",
      imagen: "archivos/cartas/pirata_juanita.png",
      habilidad: "Permite mirar cartas ocultas o del mazo según variantes oficiales de la mesa."
    },
    {
      nombre: "Will (Bahía de la Muerte) (1 carta)",
      imagen: "archivos/cartas/pirata_bahia.png",
      habilidad: "Pirata clásico del juego base. En alta mar impone respeto y gana como pirata estándar."
    },
    {
      nombre: "La Tigresa (1 carta - Comodín)",
      imagen: "archivos/cartas/pirata_tigresa.png",
      habilidad: "Al momento de jugarla en la mesa, elegís si actúa como un Pirata o como una Bandera de Huida."
    },
    {
      nombre: "Mary Thorne (1 carta - Expansión)",
      imagen: "archivos/cartas/mary_thorne.png",
      habilidad: "Si gana la baza, obliga a un rival a jugar su próxima carta al azar en el turno siguiente."
    }
  ],
  monstruos: [
    {
      id: "kraken",
      nombre: "Kraken - El Destructor (1 carta)",
      imagen: "archivos/cartas/kraken.png",
      descripcion: "¡Nadie gana la baza! Se anula por completo. El que jugó el Kraken reparte en la siguiente mano."
    },
    {
      id: "ballena",
      nombre: "Ballena Blanca - El Anulador (1 carta)",
      imagen: "archivos/cartas/ballena.png",
      descripcion: "Anula los poderes especiales: piratas, sirenas y SK valen 0. Gana el número más alto en juego."
    },
    {
      id: "raya_moteada",
      nombre: "Raya Moteada - El Inversor (1 carta)",
      imagen: "archivos/cartas/raya_moteada.png",
      descripcion: "Invierte las matemáticas: en esa baza, ¡la carta numérica de MENOR valor es la que gana!"
    },
    {
      id: "davy_jones",
      nombre: "Davy Jones - Cazador de Monstruos (1 carta)",
      imagen: "archivos/cartas/davy_jones.png",
      descripcion: "No gana bazas por sí mismo (vale 0), pero elimina y destruye a todos los Monstruos Marinos de la mesa. Otorga +20 pts de bono por cada monstruo eliminado."
    }
  ],
  accion: [
    {
      id: "huida",
      nombre: "Bandera de Huida / Escape (5 cartas)",
      imagen: "archivos/cartas/huida.png",
      descripcion: "Valor 0. Pierde siempre contra cualquier carta del juego. Se usa para rendirse en una baza a propósito cuando querés no ganar manos."
    },
    {
      id: "botin",
      nombre: "Botín / Monedas de Alianza (2 cartas)",
      imagen: "archivos/cartas/botin.png",
      descripcion: "Vale 0. Forma una alianza con quien gane esa baza: si ambos cumplen su apuesta de bazas, cobran +20 pts c/u."
    },
    {
      id: "tablon",
      nombre: "Caminar por el Tablón (1 carta)",
      imagen: "archivos/cartas/tablon.png",
      descripcion: "Manda fuera de combate a un Pirata de la baza antes de evaluar quién gana la mano."
    },
    {
      id: "canon",
      nombre: "La Última Descarga - El Cañón (1 carta)",
      imagen: "archivos/cartas/canon.png",
      descripcion: "No gana bazas y no funciona como huida. Al jugarla en tu turno, posponés tu jugada hasta después de que todos hayan tirado. Te quedás con una carta menos el resto de la ronda y te salteás la última baza."
    }
  ],
  franco: [
    {
      id: "carta_blanca",
      nombre: "Comodines Blancos estilo Canasta (8 cartas en el mazo)",
      imagen: "archivos/cartas/carta_blanca.png",
      descripcion: "Si al repartir te toca una Carta Blanca, avisá en voz alta, apartala frente a vos (dura toda la partida) y robá otra nueva. Al final de la Ronda 10 suman: 1 = +10 pts | 2 = +20 pts | 3 = +50 pts | 4+ = +100 pts."
    }
  ]
};

export const LISTA_EVENTOS_BONO = [
  { id: "pirata_por_sk", etiqueta: "Pirata capturado por SK (+30 c/u)", puntos: 30, maximo: 7 },
  { id: "sk_por_sirena", etiqueta: "Skull King con Sirena (+40 c/u)", puntos: 40, maximo: 1 },
  { id: "sirena_por_pirata", etiqueta: "Sirena capturada por Pirata (+20 c/u)", puntos: 20, maximo: 2 },
  { id: "catorce_negro", etiqueta: "14 Negro / Triunfo (+20 c/u)", puntos: 20, maximo: 1 },
  { id: "catorce_color", etiqueta: "14 de Color (Verde/Am/Viol) (+10 c/u)", puntos: 10, maximo: 3 },
  { id: "ocho_expansion", etiqueta: "8 capturado (+5 pts c/u)", puntos: 5, maximo: 4 },
  { id: "siete_expansion", etiqueta: "7 capturado (-5 pts c/u)", puntos: -5, maximo: 4 },
  { id: "alianza_botin", etiqueta: "Alianza de Botín / Moneda (+20 c/u)", puntos: 20, maximo: 2 },
  { id: "monstruo_davy", etiqueta: "Monstruo destruido por Davy Jones (+20 c/u)", puntos: 20, maximo: 3 }
];