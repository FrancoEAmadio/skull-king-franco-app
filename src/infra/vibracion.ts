let activa = true;

export function configurarVibracion(habilitada: boolean): void {
  activa = habilitada;
}

export function vibracionSoportada(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

/** Vibración corta de feedback táctil (solo en dispositivos que la soportan). */
export function vibrar(milisegundos: number | number[] = 18): void {
  if (!activa) return;
  try {
    navigator.vibrate?.(milisegundos);
  } catch {
    /* ignorado */
  }
}
