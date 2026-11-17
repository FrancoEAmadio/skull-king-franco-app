/** Puestos con empates: quienes tienen los mismos puntos comparten puesto (110, 110, 80 → 1, 1, 3). Espera la lista ya ordenada de mayor a menor. */
export function puestosConEmpate(puntos: number[]): number[] {
  return puntos.map((p, i) => {
    const primero = puntos.findIndex((x) => x === p);
    return primero === -1 ? i + 1 : primero + 1;
  });
}
