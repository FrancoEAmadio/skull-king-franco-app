import { useId } from 'react';

/** Logo propio: calavera con corona y dos sables cruzados, dorado sobre azul noche. */
export function LogoSkullKing({ tamano = 120 }: { tamano?: number }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 512 512" role="img" aria-label="Skull King">
      <defs>
        <linearGradient id={id + 'f'} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5a3d1e" />
          <stop offset="1" stopColor="#0b1437" />
        </linearGradient>
        <linearGradient id={id + 'o'} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f1d36b" />
          <stop offset="1" stopColor="#c9951c" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="96" fill={`url(#${id}f)`} />
      <g stroke={`url(#${id}o)`} strokeLinecap="round" fill="none" strokeWidth="28">
        <path d="M96 110L400 414M350 364L420 434M316 398L384 330" />
        <path d="M416 110L112 414M162 364L92 434M196 398L128 330" />
      </g>
      <ellipse cx="256" cy="290" rx="112" ry="118" fill="#0b1437" />
      <g stroke="#0b1437" strokeWidth="10" strokeLinejoin="round" fill={`url(#${id}o)`}>
        <g transform="translate(112 150) scale(12)">
          <path fillRule="evenodd" strokeWidth="0.6" d="M12 2.5c-4.6 0-8 3.2-8 7.4 0 2.5 1.2 4.4 3 5.6V19c0 .8.6 1.5 1.5 1.5h7c.9 0 1.5-.7 1.5-1.5v-3.5c1.8-1.2 3-3.1 3-5.6 0-4.2-3.4-7.4-8-7.4zM8.6 8.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM15.4 8.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM12 12.8l-1.3 2.6h2.6z" />
        </g>
        <g transform="translate(172 40) scale(7)">
          <path strokeWidth="0.9" d="M3 18h18l1.5-10-5 4L12 5 7 12l-5-4zM3 19.5h18v2H3z" />
        </g>
      </g>
    </svg>
  );
}
