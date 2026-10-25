import { useMemo, useState } from 'react';

export interface SerieGrafico {
  nombre: string;
  /** Puntaje acumulado: posición 0 = antes de la primera ronda. */
  puntos: number[];
}

interface Props {
  series: SerieGrafico[];
  /** Etiquetas del eje X (posición 0 = "Inicio"). Si falta, se usa R1, R2… */
  etiquetas?: string[];
  titulo?: string;
}

export const COLORES_SERIES = [
  '#fbbf24',
  '#38bdf8',
  '#f87171',
  '#34d399',
  '#c084fc',
  '#fb923c',
  '#f472b6',
  '#a3e635',
  '#94a3b8',
];

const ANCHO = 340;
const ALTO = 200;
const MARGEN = { izq: 40, der: 12, arr: 12, aba: 26 };

function formatear(valor: number): string {
  return Math.round(valor).toLocaleString('es-AR');
}

/**
 * Gráfico de líneas (SVG responsive) con el puntaje acumulado de cada pirata, ronda a ronda.
 * - Tocá una ronda para ver el puntaje de cada jugador en ese momento.
 * - Tocá un nombre de la leyenda para prender o apagar su línea y comparar solo a quienes quieras.
 */
export function GraficoEvolucion({ series: todasLasSeries, etiquetas, titulo = 'Evolución del puntaje por ronda' }: Props) {
  const [indiceActivo, setIndiceActivo] = useState<number | null>(null);
  const [apagadas, setApagadas] = useState<string[]>([]);

  // Solo se dibujan las líneas prendidas; el color de cada jugador no cambia al apagar a otros.
  const series = useMemo(
    () => todasLasSeries.filter((serie) => !apagadas.includes(serie.nombre)),
    [todasLasSeries, apagadas]
  );
  const cantidadPuntos = Math.max(...todasLasSeries.map((serie) => serie.puntos.length), 0);

  const alternar = (nombre: string) =>
    setApagadas((actuales) => {
      if (actuales.includes(nombre)) return actuales.filter((n) => n !== nombre);
      // Siempre queda al menos una línea prendida.
      if (todasLasSeries.length - actuales.length <= 1) return actuales;
      return [...actuales, nombre];
    });

  const geometria = useMemo(() => {
    const todos = series.flatMap((serie) => serie.puntos);
    const minimo = Math.min(0, ...todos);
    const maximo = Math.max(100, ...todos);
    const rango = maximo - minimo || 1;
    const anchoUtil = ANCHO - MARGEN.izq - MARGEN.der;
    const altoUtil = ALTO - MARGEN.arr - MARGEN.aba;
    const x = (indice: number) =>
      MARGEN.izq + (cantidadPuntos > 1 ? (indice / (cantidadPuntos - 1)) * anchoUtil : 0);
    const y = (valor: number) => MARGEN.arr + (1 - (valor - minimo) / rango) * altoUtil;
    return { minimo, maximo, rango, anchoUtil, x, y };
  }, [series, cantidadPuntos]);

  if (cantidadPuntos < 2 || todasLasSeries.length === 0) return null;

  const { minimo, maximo, rango, anchoUtil, x, y } = geometria;
  const marcasY = [minimo, minimo + rango / 2, maximo];
  const etiquetaX = (indice: number) =>
    etiquetas?.[indice] ?? (indice === 0 ? 'Inicio' : `R${indice}`);
  // Con muchas rondas se muestran solo algunas etiquetas para que no se pisen.
  const pasoEtiqueta = cantidadPuntos > 12 ? 2 : 1;
  const anchoColumna = anchoUtil / Math.max(cantidadPuntos - 1, 1);

  const colorDe = (nombre: string) =>
    COLORES_SERIES[Math.max(0, todasLasSeries.findIndex((serie) => serie.nombre === nombre)) % COLORES_SERIES.length]!;

  const detalle =
    indiceActivo === null
      ? null
      : series
          .map((serie) => ({
            nombre: serie.nombre,
            color: colorDe(serie.nombre),
            valor: serie.puntos[Math.min(indiceActivo, serie.puntos.length - 1)] ?? 0,
          }))
          .sort((a, b) => b.valor - a.valor);

  return (
    <figure className="m-0 flex flex-col gap-2">
      <svg
        viewBox={`0 0 ${ANCHO} ${ALTO}`}
        className="h-auto w-full touch-pan-y select-none"
        role="img"
        aria-label={titulo}
      >
        {marcasY.map((marca) => (
          <g key={marca}>
            <line
              x1={MARGEN.izq}
              x2={ANCHO - MARGEN.der}
              y1={y(marca)}
              y2={y(marca)}
              stroke="#334155"
              strokeWidth={1}
              strokeDasharray="2 4"
            />
            <text x={MARGEN.izq - 5} y={y(marca) + 3.5} textAnchor="end" fontSize={11} fill="#94a3b8">
              {formatear(marca)}
            </text>
          </g>
        ))}

        {minimo < 0 && (
          <line
            x1={MARGEN.izq}
            x2={ANCHO - MARGEN.der}
            y1={y(0)}
            y2={y(0)}
            stroke="#64748b"
            strokeWidth={1}
          />
        )}

        {Array.from({ length: cantidadPuntos }, (_, indice) =>
          indice % pasoEtiqueta === 0 || indice === cantidadPuntos - 1 ? (
            <text
              key={indice}
              x={x(indice)}
              y={ALTO - 8}
              textAnchor="middle"
              fontSize={11}
              fill={indice === indiceActivo ? '#fbbf24' : '#94a3b8'}
              fontWeight={indice === indiceActivo ? 700 : 400}
            >
              {etiquetaX(indice)}
            </text>
          ) : null
        )}

        {indiceActivo !== null && (
          <line
            x1={x(indiceActivo)}
            x2={x(indiceActivo)}
            y1={MARGEN.arr}
            y2={ALTO - MARGEN.aba}
            stroke="#fbbf24"
            strokeWidth={1}
            strokeOpacity={0.6}
          />
        )}

        {series.map((serie) => {
          const color = colorDe(serie.nombre);
          const puntos = serie.puntos
            .map((valor, indice) => `${x(indice).toFixed(1)},${y(valor).toFixed(1)}`)
            .join(' ');
          const ultimo = serie.puntos.length - 1;
          return (
            <g key={serie.nombre}>
              <polyline
                points={puntos}
                fill="none"
                stroke={color}
                strokeWidth={2.8}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <circle cx={x(ultimo)} cy={y(serie.puntos[ultimo]!)} r={3.8} fill={color} stroke="#090d16" strokeWidth={1.5} />
              {indiceActivo !== null && indiceActivo <= ultimo && (
                <circle
                  cx={x(indiceActivo)}
                  cy={y(serie.puntos[indiceActivo]!)}
                  r={4.2}
                  fill={color}
                  stroke="#090d16"
                  strokeWidth={1.5}
                />
              )}
            </g>
          );
        })}

        {/* Zonas táctiles: una columna por ronda */}
        {Array.from({ length: cantidadPuntos }, (_, indice) => (
          <rect
            key={`zona-${indice}`}
            x={x(indice) - anchoColumna / 2}
            y={MARGEN.arr}
            width={anchoColumna}
            height={ALTO - MARGEN.arr - MARGEN.aba}
            fill="transparent"
            onPointerEnter={(evento) => {
              if (evento.pointerType === 'mouse') setIndiceActivo(indice);
            }}
            onClick={() => setIndiceActivo((actual) => (actual === indice ? null : indice))}
          />
        ))}
      </svg>

      {detalle && indiceActivo !== null && (
        <div className="rounded-xl border border-amber-500/30 bg-slate-950/80 p-2.5">
          <span className="mb-1.5 block text-sm font-black uppercase tracking-wide text-amber-300">
            {indiceActivo === 0 ? 'Punto de partida' : `Tras la ${etiquetaX(indiceActivo)}`}
          </span>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
            {detalle.map((fila, posicion) => (
              <li key={fila.nombre} className="flex items-center justify-between gap-2 text-sm">
                <span className="flex min-w-0 items-center gap-1.5 text-slate-200">
                  <span className="text-sm text-slate-400">{posicion + 1}.</span>
                  <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: fila.color }} />
                  <span className="truncate">{fila.nombre}</span>
                </span>
                <span className={`font-black ${fila.valor >= 0 ? 'text-white' : 'text-red-400'}`}>
                  {formatear(fila.valor)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <figcaption className="flex flex-wrap gap-2">
        {todasLasSeries.map((serie) => {
          const prendida = !apagadas.includes(serie.nombre);
          return (
            <button
              key={serie.nombre}
              type="button"
              role="switch"
              aria-checked={prendida}
              onClick={() => alternar(serie.nombre)}
              className={`flex min-h-11 items-center gap-2 rounded-full border px-3.5 py-1.5 text-base font-bold ${
                prendida
                  ? 'border-amber-400 bg-amber-500/15 text-amber-100'
                  : 'border-slate-700 bg-slate-900/80 text-slate-500 line-through'
              }`}
            >
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: prendida ? colorDe(serie.nombre) : '#475569' }}
              />
              {serie.nombre}
            </button>
          );
        })}
      </figcaption>
    </figure>
  );
}
