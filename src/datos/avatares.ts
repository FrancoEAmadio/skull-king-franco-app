/** Iconos de pirata que se pueden asignar a cada jugador: todos tienen que ver con el juego. */
export const AVATARES: string[] = [
  '🏴‍☠️', '💀', '☠️', '🦜', '🐒', '⚓', '🗡️', '🧭',
  '🗺️', '⛵', '🚢', '🐙', '🦑', '🦈', '🐋', '🧜‍♀️',
  '🏝️', '🌊', '💎', '🪙', '👑', '🍾', '🔱', '🎩',
];

/** Si el jugador todavía no eligió (o su icono ya no está en la lista), se le asigna uno estable según su id. */
export function avatarDe(id: string, avatar?: string): string {
  if (avatar && AVATARES.includes(avatar)) return avatar;
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return AVATARES[hash % AVATARES.length]!;
}
