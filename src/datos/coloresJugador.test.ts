import { describe, expect, it } from 'vitest';
import type { JugadorPermanente } from '../tipos';
import { colorGraficoDe } from './coloresJugador';
import { COLOR_LINEA } from '../ui/tonos';
import { construirSeriesEvolucion } from '../dominio/comparativas';

const perm = (id: string, nombre: string, colorTarjeta: string): JugadorPermanente =>
  ({ id, nombre, colorTarjeta, estadisticas: {}, evolucion: [] }) as unknown as JugadorPermanente;

describe('colorGraficoDe', () => {
  const lista = [perm('1', 'Franco', 'rojo'), perm('2', 'Lady', 'azul')];
  it('usa el color de la tarjeta, por id o por nombre', () => {
    expect(colorGraficoDe(lista, { permanenteId: '1', nombre: 'Franco' })).toBe(COLOR_LINEA.rojo);
    expect(colorGraficoDe(lista, { nombre: ' lady ' })).toBe(COLOR_LINEA.azul);
  });
  it('Barbagrís va en gris y un desconocido queda sin color propio', () => {
    expect(colorGraficoDe(lista, { nombre: 'Barbagrís', fantasma: true })).toBe(COLOR_LINEA.pizarra);
    expect(colorGraficoDe(lista, { nombre: 'Eguren' })).toBeUndefined();
  });
  it('el color viaja a las series del gráfico', () => {
    const { series } = construirSeriesEvolucion([{ nombre: 'Franco', historial: [], color: COLOR_LINEA.rojo }]);
    expect(series[0]?.color).toBe(COLOR_LINEA.rojo);
  });
});
