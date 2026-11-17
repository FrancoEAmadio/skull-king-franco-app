import { useId } from 'react';

export interface NodoDiagrama {
  id: string;
  x: number;
  y: number;
  /** Rutas de imagen (relativas a la raíz pública). Varias = miniaturas apiladas. */
  imgs: string[];
  nombre: string;
  color: string;
}

export interface FlechaDiagrama {
  de: string;
  a: string;
  etiqueta?: string;
  /** Curvatura (positiva o negativa) para que no se pisen las diagonales. */
  curva?: number;
  punteada?: boolean;
  doble?: boolean;
  /** Color de la flecha (por ejemplo el de la carta que gana). Por defecto, marrón. */
  color?: string;
  /** Posición de la etiqueta a lo largo de la flecha (0 a 1, por defecto 0.5). */
  t?: number;
}

interface Props {
  ancho?: number;
  alto: number;
  nodos: NodoDiagrama[];
  flechas: FlechaDiagrama[];
  onTocar?: (idNodo: string) => void;
}

const W = 19;
const H = 27;
const ETIQUETA = 7;

function bordeRect(dx: number, dy: number, mw: number, mh: number): number {
  const tx = dx === 0 ? Infinity : mw / Math.abs(dx);
  const ty = dy === 0 ? Infinity : mh / Math.abs(dy);
  return Math.min(tx, ty);
}

/** Diagrama con miniaturas de cartas y flechas SVG con punta y recorrido animado. */
export function DiagramaJerarquia({ alto, nodos, flechas, onTocar }: Props) {
  const uid = useId().replace(/:/g, '');
  const porId = Object.fromEntries(nodos.map((n) => [n.id, n]));
  const mw = W / 2 + 2.5;
  const mh = (H + ETIQUETA) / 2 + 2.5;
  const colores = Array.from(new Set(flechas.map((f) => f.color ?? '#5a3d1e')));
  const marcador = (color: string) => `${uid}m${colores.indexOf(color)}`;

  return (
    <div className="relative w-full select-none" style={{ aspectRatio: `100 / ${alto}` }}>
      <svg viewBox={`0 0 100 ${alto}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          {colores.map((color) => (
            <marker key={color} id={marcador(color)} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M0 0L10 5L0 10z" fill={color} />
            </marker>
          ))}
        </defs>
        {flechas.map((f, i) => {
          const a = porId[f.de];
          const b = porId[f.a];
          if (!a || !b) return null;
          const cy = (n: NodoDiagrama) => n.y;
          const dx = b.x - a.x;
          const dy = cy(b) - cy(a);
          const ta = bordeRect(dx, dy, mw, mh);
          const tb = bordeRect(dx, dy, mw, mh);
          const sx = a.x + dx * Math.min(ta, 0.45);
          const sy = cy(a) + dy * Math.min(ta, 0.45);
          const ex = b.x - dx * Math.min(tb, 0.45);
          const ey = cy(b) - dy * Math.min(tb, 0.45);
          const len = Math.hypot(ex - sx, ey - sy) || 1;
          const nx = -(ey - sy) / len;
          const ny = (ex - sx) / len;
          const k = (f.curva ?? 0) * 10;
          const qx = (sx + ex) / 2 + nx * k;
          const qy = (sy + ey) / 2 + ny * k;
          const t = f.t ?? 0.5;
          const color = f.color ?? '#5a3d1e';
          const mx = (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * qx + t * t * ex;
          const my = (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * qy + t * t * ey;
          return (
            <g key={i}>
              <path
                d={`M${sx} ${sy} Q${qx} ${qy} ${ex} ${ey}`}
                fill="none"
                stroke={color}
                strokeWidth={0.9}
                strokeLinecap="round"
                strokeDasharray={f.punteada ? '1.6 1.6' : undefined}
                markerEnd={`url(#${marcador(color)})`}
                markerStart={f.doble ? `url(#${marcador(color)})` : undefined}
              />
              {!f.punteada && (
                <path d={`M${sx} ${sy} Q${qx} ${qy} ${ex} ${ey}`} fill="none" stroke="#f1d36b" strokeWidth={0.7} strokeLinecap="round" className="flecha-anim" />
              )}
              {f.etiqueta && (
                <text
                  x={mx}
                  y={my}
                  textAnchor="middle"
                  fontSize={3.3}
                  fontWeight={800}
                  fill={color}
                  stroke="#fff"
                  strokeWidth={1.2}
                  paintOrder="stroke"
                >
                  {f.etiqueta}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {nodos.map((n) => (
        <button
          type="button"
          key={n.id}
          onClick={() => onTocar?.(n.id)}
          aria-label={`Ver ${n.nombre}`}
          className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
          style={{ left: `${n.x}%`, top: `${(n.y / alto) * 100}%`, width: `${W}%` }}
        >
          <div className="relative w-full" style={{ aspectRatio: '0.7' }}>
            {n.imgs.map((src, i) => {
              const total = n.imgs.length;
              const desp = total > 1 ? (i - (total - 1) / 2) * 22 : 0;
              return (
                <img
                  key={src}
                  src={`./${src}`}
                  alt=""
                  className="absolute inset-0 h-full w-full rounded-md bg-white object-cover shadow"
                  style={{ border: `2px solid ${n.color}`, transform: `translateX(${desp}%) rotate(${total > 1 ? (i - (total - 1) / 2) * 6 : 0}deg)`, zIndex: i }}
                />
              );
            })}
          </div>
          <span className="-mx-3 mt-1 text-center text-[10px] font-bold leading-tight" style={{ color: n.color }}>
            {n.nombre}
          </span>
        </button>
      ))}
    </div>
  );
}
