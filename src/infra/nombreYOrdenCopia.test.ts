/**
 * Nombre del archivo exportado y orden del historial al importar (fechas viejas con a. m. / p. m.).
 */
import { describe, expect, it } from 'vitest';
import { combinarCopiaSeguridad, interpretarCopiaSeguridad, nombreArchivoCopia } from './almacenamiento';

describe('nombreArchivoCopia', () => {
  it('dice cuántas partidas tiene y cuándo se exportó', () => {
    expect(nombreArchivoCopia(14, new Date(2026, 10, 24, 12, 50))).toBe('Skull King - 14 partidas - 24-11-2026 12h50.json');
  });
  it('usa singular con una partida y completa con ceros', () => {
    expect(nombreArchivoCopia(1, new Date(2026, 0, 5, 7, 3))).toBe('Skull King - 1 partida - 05-01-2026 07h03.json');
  });
  it('no usa caracteres que los sistemas de archivos rechazan', () => {
    expect(nombreArchivoCopia(3, new Date(2026, 5, 9, 23, 59))).not.toMatch(/[\\/:*?"<>|]/);
  });
});

describe('orden del historial al importar', () => {
  const partida = (fecha: string, nombre: string) => ({
    fecha,
    ranking: [{ nombre, puntos: 10, historial: [] }],
  });
  const copiaCon = (fechas: string[]) => {
    const texto = JSON.stringify({
      app: 'skull-king-franco-app',
      version: 1,
      exportada: '2026-11-24T19:34:44.131Z',
      jugadores: [],
      historial: fechas.map((f, i) => partida(f, `J${i}`)),
    });
    const r = interpretarCopiaSeguridad(texto);
    if (!r.ok) throw new Error(r.motivo);
    return r.copia;
  };

  it('ordena bien las fechas con a. m. y p. m. (la más nueva primero)', () => {
    const fechas = [
      '28/08/2026, 09:48 p. m.',
      '28/08/2026, 11:57 p. m.',
      '29/08/2026, 12:49 a. m.',
      '29/08/2026, 01:41 a. m.',
      '29/08/2026, 02:29 a. m.',
    ];
    const { historial } = combinarCopiaSeguridad([], [], copiaCon(fechas));
    expect(historial.map((p) => p.fecha)).toEqual([
      '29/08/2026, 02:29 a. m.',
      '29/08/2026, 01:41 a. m.',
      '29/08/2026, 12:49 a. m.',
      '28/08/2026, 11:57 p. m.',
      '28/08/2026, 09:48 p. m.',
    ]);
  });

  it('12:xx p. m. es mediodía y sigue ordenando bien contra el formato de 24 h', () => {
    const { historial } = combinarCopiaSeguridad([], [], copiaCon(['22/11/2026, 12:10 p. m.', '22/11/2026, 00:53', '22/11/2026, 13:05']));
    expect(historial.map((p) => p.fecha)).toEqual(['22/11/2026, 13:05', '22/11/2026, 12:10 p. m.', '22/11/2026, 00:53']);
  });
});
