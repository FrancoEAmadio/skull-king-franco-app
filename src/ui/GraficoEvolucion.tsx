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
 * - Tocá un nombre de la leyenda para resaltar su curva y atenuar el resto.
 */
export function GraficoEvolucion({ series, etiquetas, titulo = 'Evolución del puntaje por ronda' }: Props) {
  const [indiceActivo, setIndiceActivo] = useState<number | null>(null);
  const [resaltada, setResaltada] = useState<string | null>(null);

  const cantidadPuntos = Math.max(...series.map((serie) => serie.puntos.length), 0);

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

  if (cantidadPuntos < 2 || series.length === 0) return null;

  const { minimo, maximo, rango, anchoUtil, x, y } = geometria;
  const marcasY = [minimo, minimo + rango / 2, maximo];
  const etiquetaX = (indice: number) =>
    etiquetas?.[indice] ?? (indice === 0 ? 'Inicio' : `R${indice}`);
  // Con muchas rondas se muestran solo algunas etiquetas para que no se pisen.
  const pasoEtiqueta = cantidadPuntos > 12 ? 2 : 1;
  const anchoColumna = anchoUtil / Math.max(cantidadPuntos - 1, 1);

  const detalle =
    indiceActivo === null
      ? null
      : series
          .map((serie, indiceSerie) => ({
            nombre: serie.nombre,
            color: COLORES_SERIES[indiceSerie % COLORES_SERIES.length]!,
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
            <text x={MARGEN.izq - 5} y={y(marca) + 3.5} textAnchor="end" fontSize={10} fill="#94a3b8">
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
              fontSize={10}
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

        {series.map((serie, indiceSerie) => {
          const color = COLORES_SERIES[indiceSerie % COLORES_SERIES.length]!;
          const atenuada = resaltada !== null && resaltada !== serie.nombre;
          const puntos = serie.puntos
            .map((valor, indice) => `${x(indice).toFixed(1)},${y(valor).toFixed(1)}`)
            .join(' ');
          const ultimo = serie.puntos.length - 1;
          return (
            <g key={serie.nombre} opacity={atenuada ? 0.18 : 1}>
              <polyline
                points={puntos}
                fill="none"
                stroke={color}
                strokeWidth={resaltada === serie.nombre ? 3.5 : 2.5}
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
          <span className="mb-1.5 block text-[11px] font-black uppercase tracking-wide text-amber-300">
            {indiceActivo === 0 ? 'Punto de partida' : `Tras la ${etiquetaX(indiceActivo)}`}
          </span>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
            {detalle.map((fila, posicion) => (
              <li key={fila.nombre} className="flex items-center justify-between gap-2 text-xs">
                <span className="flex min-w-0 items-center gap-1.5 text-slate-200">
                  <span className="text-[11px] text-slate-400">{posicion + 1}.</span>
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

      <figcaption className="flex flex-wrap gap-1.5">
        {series.map((serie, indice) => {
          const activa = resaltada === serie.nombre;
          return (
            <button
              key={serie.nombre}
              type="button"
              aria-pressed={activa}
              onClick={() => setResaltada(activa ? null : serie.nombre)}
              className={`flex min-h-8 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                activa
                  ? 'border-amber-400 bg-amber-500/15 text-amber-200'
                  : 'border-slate-700 bg-slate-900/80 text-slate-200 hover:border-slate-500'
              }`}
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: COLORES_SERIES[indice % COLORES_SERIES.length] }}
              />
              {serie.nombre}
            </button>
          );
        })}
      </figcaption>
    </figure>
  );
}
