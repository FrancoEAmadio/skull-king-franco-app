import type { JugadorPermanente } from '../tipos';
import type { NombreTono } from '../ui/tonos';

/** Colores que puede elegir un jugador (9 como máximo: es el tope de jugadores; el negro y el gris quedan para cosas del juego). */
export const PALETA_JUGADOR: NombreTono[] = [
  'rojo', 'azul', 'verde', 'amarillo', 'violeta', 'naranja',
  'rosa', 'agua', 'lima',
];

function esTono(valor: unknown): valor is NombreTono {
  return typeof valor === 'string' && (PALETA_JUGADOR as string[]).includes(valor);
}

function hashDe(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return hash;
}

/** Color de la tarjeta (borde y tinte). Si todavía no se asignó uno, sale de forma estable según el id. */
export function colorTarjetaDe(id: string, colorTarjeta?: string): NombreTono {
  if (esTono(colorTarjeta)) return colorTarjeta;
  return PALETA_JUGADOR[hashDe(id) % PALETA_JUGADOR.length]!;
}

/** Color de fondo del emoji. Nunca coincide con el de la tarjeta. */
export function colorAvatarDe(id: string, colorAvatar?: string, colorTarjeta?: string): NombreTono {
  const tarjeta = colorTarjetaDe(id, colorTarjeta);
  if (esTono(colorAvatar) && colorAvatar !== tarjeta) return colorAvatar;
  const base = (hashDe(id) + 5) % PALETA_JUGADOR.length;
  for (let i = 0; i < PALETA_JUGADOR.length; i += 1) {
    const candidato = PALETA_JUGADOR[(base + i) % PALETA_JUGADOR.length]!;
    if (candidato !== tarjeta) return candidato;
  }
  return 'azul';
}

/** Primer color de la paleta que no usa ningún otro jugador (o el menos repetido, si ya se agotaron). */
function colorLibre(usados: NombreTono[], desde = 0): NombreTono {
  for (let i = 0; i < PALETA_JUGADOR.length; i += 1) {
    const candidato = PALETA_JUGADOR[(desde + i) % PALETA_JUGADOR.length]!;
    if (!usados.includes(candidato)) return candidato;
  }
  const conteo = PALETA_JUGADOR.map((t) => usados.filter((u) => u === t).length);
  return PALETA_JUGADOR[conteo.indexOf(Math.min(...conteo))]!;
}

/** Colores para un jugador nuevo: distintos a los de los demás. */
export function coloresParaNuevo(existentes: JugadorPermanente[]): { colorTarjeta: NombreTono; colorAvatar: NombreTono } {
  const tarjeta = colorLibre(existentes.map((j) => colorTarjetaDe(j.id, j.colorTarjeta)));
  let avatar = colorLibre(existentes.map((j) => colorAvatarDe(j.id, j.colorAvatar, j.colorTarjeta)), 6);
  if (avatar === tarjeta) avatar = PALETA_JUGADOR[(PALETA_JUGADOR.indexOf(tarjeta) + 6) % PALETA_JUGADOR.length]!;
  return { colorTarjeta: tarjeta, colorAvatar: avatar };
}

/**
 * Deja a todos los jugadores con colores válidos y con color de tarjeta distinto entre sí.
 * `prioridadId` es el jugador que acaba de elegir su color: conserva el suyo y, si otro tenía
 * el mismo, ese otro pasa automáticamente a un color libre.
 */
export function normalizarColores(
  lista: JugadorPermanente[],
  prioridadId?: string
): { lista: JugadorPermanente[]; cambio: boolean } {
  const orden = lista
    .map((jug, indice) => ({ jug, indice }))
    .sort((a, b) => Number(b.jug.id === prioridadId) - Number(a.jug.id === prioridadId) || a.indice - b.indice);
  const usados: NombreTono[] = [];
  const tarjetas = new Map<string, NombreTono>();
  // 1.ª pasada: cada uno conserva su color si es válido y nadie lo tomó antes.
  for (const { jug } of orden) {
    if (esTono(jug.colorTarjeta) && !usados.includes(jug.colorTarjeta)) {
      tarjetas.set(jug.id, jug.colorTarjeta);
      usados.push(jug.colorTarjeta);
    }
  }
  // 2.ª pasada: a los que quedaron sin color (repetido o inexistente) se les da uno libre.
  for (const { jug } of orden) {
    if (tarjetas.has(jug.id)) continue;
    const avatarPrevio = esTono(jug.colorAvatar) ? jug.colorAvatar : undefined;
    const libres = PALETA_JUGADOR.filter((t) => !usados.includes(t) && t !== avatarPrevio);
    const tarjeta = libres[0] ?? colorLibre(usados);
    tarjetas.set(jug.id, tarjeta);
    usados.push(tarjeta);
  }

  const nuevos = new Map<string, JugadorPermanente>();
  let cambio = false;
  for (const { jug } of orden) {
    const tarjeta = tarjetas.get(jug.id)!;
    const avatar = colorAvatarDe(jug.id, jug.colorAvatar, tarjeta);
    if (tarjeta !== jug.colorTarjeta || avatar !== jug.colorAvatar) cambio = true;
    nuevos.set(jug.id, { ...jug, colorTarjeta: tarjeta, colorAvatar: avatar });
  }
  return { lista: lista.map((jug) => nuevos.get(jug.id)!), cambio };
}

/** Migración al cargar: asigna colores a quien no tiene y corrige repetidos. */
export function completarColores(lista: JugadorPermanente[]) {
  return normalizarColores(lista);
}
