import { useState } from 'react';

interface Props {
  src: string;
  alt: string;
  className?: string;
}

/** Foto de carta; si todavía no existe muestra un marcador «Próximamente» del mismo tamaño. */
export function ImagenCarta({ src, alt, className = '' }: Props) {
  const [fallo, setFallo] = useState(false);
  if (fallo) {
    return (
      <span
        role="img"
        aria-label={`${alt} (foto próximamente)`}
        className={`flex aspect-[2/3] items-center justify-center rounded-md border-2 border-dashed border-slate-300 bg-slate-100 p-1 text-center text-[10px] font-semibold leading-tight text-slate-500 ${className}`}
      >
        Próximamente
        <br />
        {alt}
      </span>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setFallo(true)} />;
}
