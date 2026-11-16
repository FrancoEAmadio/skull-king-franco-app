/** Iconos de pirata (imágenes) que se pueden asignar a cada jugador. En el jugador se guardan como "img:nombre". */
export const AVATARES: string[] = [
  'img:pirata-gris',
  'img:capitan',
  'img:pirata-panuelo',
  'img:pirata-marron',
  'img:pirata-mujer',
  'img:pirata-pata-palo',
  'img:pirata-nino',
  'img:esqueleto',
  'img:fantasma',
  'img:calavera-sombrero',
  'img:calavera-espadas',
  'img:sirena',
  'img:mono',
  'img:loro',
  'img:calamar',
  'img:monstruo',
  'img:mantarraya',
  'img:pulpo',
  'img:tiburon',
  'img:ballena',
  'img:tortuga',
  'img:cangrejo',
  'img:gaviota',
  'img:delfin',
  'img:ancla',
  'img:bandera',
  'img:barco',
  'img:barril',
  'img:brujula',
  'img:canon',
  'img:catalejo',
  'img:cofre',
  'img:corona',
  'img:diamante',
  'img:espadas',
  'img:faro',
  'img:farol',
  'img:garfio',
  'img:isla',
  'img:llave',
  'img:mapa',
  'img:moneda',
  'img:pata-palo',
  'img:pergamino',
  'img:reloj-arena',
  'img:ron',
  'img:timon',
  'img:tridente',
];

/** Emojis de versiones anteriores: siguen funcionando en los jugadores que ya los tenían, pero ya no se ofrecen. */
const EMOJIS_VIEJOS: string[] = [
  '🏴‍☠️', '💀', '☠️', '🦜', '🐒', '⚓', '🗡️', '🧭',
  '🗺️', '⛵', '🚢', '🐙', '🦑', '🦈', '🐋', '🧜‍♀️',
  '🏝️', '🌊', '💎', '🪙', '👑', '🍾', '🔱', '🎩',
  '🧔', '👴', '⚔️', '🛶', '🦀', '🐚', '🦅', '🐊',
];

export function esImagenAvatar(valor: string): boolean {
  return valor.startsWith('img:');
}

/** Dirección del archivo de un icono ("img:capitan"). */
export function urlAvatar(valor: string): string {
  return `${import.meta.env.BASE_URL}archivos/avatares/${valor.slice(4)}.webp`;
}

/** Si el jugador todavía no eligió (o su icono ya no existe), se le asigna uno estable según su id. */
export function avatarDe(id: string, avatar?: string): string {
  if (avatar && (AVATARES.includes(avatar) || EMOJIS_VIEJOS.includes(avatar))) return avatar;
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return AVATARES[hash % AVATARES.length]!;
}
