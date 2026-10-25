import { vibrar } from '../infra/vibracion';

interface Props {
  /** Número elegido, o null si todavía no se eligió ninguno. */
  valor: number | null;
  /** Se muestran fichas de 0 a max. */
  max: number;
  /** Primer número de la fila (por defecto 0). */
  min?: number;
  onElegir: (numero: number) => void;
  /** Fichas que no se pueden tocar (por ejemplo bazas que ya no quedan). */
  deshabilitada?: (numero: number) => boolean;
  /** Marca con un aro punteado la ficha del envite (en la fase de bazas). */
  meta?: number | null;
  /** Colorea la ficha elegida: verde si acertó, rojo si falló. */
  resultado?: 'ok' | 'mal' | null;
  etiqueta: string;
}

function medidaFicha(max: number): string {
  if (max <= 4) return '4.6rem';
  if (max <= 6) return '4.1rem';
  if (max <= 8) return '3.6rem';
  return '3.3rem';
}

export function FichasNumero({ valor, max, min = 0, onElegir, deshabilitada, meta = null, resultado = null, etiqueta }: Props) {
  const medida = medidaFicha(max);
  const numeros = Array.from({ length: max - min + 1 }, (_, i) => i + min);

  return (
    <div className="flex flex-wrap gap-x-3 gap-y-4 px-1 py-1" role="radiogroup" aria-label={etiqueta}>
      {numeros.map((numero) => {
        const elegida = valor === numero;
        const bloqueada = !elegida && (deshabilitada?.(numero) ?? false);
        const clases = [
          'ficha',
          elegida ? 'ficha-elegida' : '',
          elegida && resultado === 'ok' ? 'ficha-ok' : '',
          elegida && resultado === 'mal' ? 'ficha-mal' : '',
          meta === numero ? 'ficha-meta' : '',
        ]
          .filter(Boolean)
          .join(' ');
        return (
          <button
            key={numero}
            type="button"
            role="radio"
            aria-checked={elegida}
            aria-label={`${etiqueta}: ${numero}`}
            disabled={bloqueada}
            onClick={() => {
              vibrar();
              onElegir(numero);
            }}
            className={clases}
            style={{ width: medida, height: medida, fontSize: `calc(${medida} * 0.46)` }}
          >
            {numero}
          </button>
        );
      })}
    </div>
  );
}
