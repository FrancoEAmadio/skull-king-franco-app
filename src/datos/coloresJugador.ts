import type { JugadorPermanente } from '../tipos';
import type { NombreTono } from '../ui/tonos';

/** Colores que puede elegir un jugador (el negro y el gris quedan para cosas del juego). */
export const PALETA_JUGADOR: NombreTono[] = [
  'rojo', 'azul', 'verde', 'amarillo', 'violeta', 'naranja',
  'rosa', 'agua', 'fucsia', 'indigo', 'lima', 'cian',
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

/** Migración: a los jugadores que todavía no tienen colores se les asignan distintos entre sí. */
export function completarColores(lista: JugadorPermanente[]): { lista: JugadorPermanente[]; cambio: boolean } {
  let cambio = false;
  const resultado: JugadorPermanente[] = [];
  for (const jug of lista) {
    if (esTono(jug.colorTarjeta) && esTono(jug.colorAvatar) && jug.colorTarjeta !== jug.colorAvatar) {
      resultado.push(jug);
      continue;
    }
    const nuevos = coloresParaNuevo(resultado.concat(lista.filter((o) => o !== jug && !resultado.includes(o) && esTono(o.colorTarjeta))));
    resultado.push({
      ...jug,
      colorTarjeta: esTono(jug.colorTarjeta) ? jug.colorTarjeta : nuevos.colorTarjeta,
      colorAvatar:
        esTono(jug.colorAvatar) && jug.colorAvatar !== (esTono(jug.colorTarjeta) ? jug.colorTarjeta : nuevos.colorTarjeta)
          ? jug.colorAvatar
          : nuevos.colorAvatar,
    });
    cambio = true;
  }
  return { lista: resultado, cambio };
}
