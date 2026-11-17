import { describe, expect, it } from 'vitest';
import { puestosConEmpate } from './posiciones';

describe('puestosConEmpate', () => {
  it('sin empates numera 1, 2, 3', () => {
    expect(puestosConEmpate([150, 120, 90])).toEqual([1, 2, 3]);
  });
  it('los empatados comparten puesto', () => {
    expect(puestosConEmpate([200, 110, 110, 80])).toEqual([1, 2, 2, 4]);
    expect(puestosConEmpate([100, 100, 50])).toEqual([1, 1, 3]);
  });
});
