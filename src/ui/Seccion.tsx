import type { ReactNode } from 'react';

interface Props {
  titulo: string;
  /** Numeración "1.", "2."... que se muestra antes del título. */
  numero?: number;
  /** Dato a la derecha del encabezado (por ejemplo "Envite 2" o "3/3"). */
  marcador?: ReactNode;
  /** Si se pasa onToggle, la sección es un acordeón. */
  abierto?: boolean;
  onToggle?: () => void;
  children: ReactNode;
}

/** Tarjeta blanca con título azul en mayúsculas, igual para todos los bloques. */
export function Seccion({ titulo, numero, marcador, abierto = true, onToggle, children }: Props) {
  const cabecera = (
    <>
      <h3 className="tarjeta-titulo !font-sans">
        {numero !== undefined && <span className="mr-1.5 opacity-60">{numero}.</span>}
        {titulo}
      </h3>
      <span className="flex items-center gap-2">
        {marcador !== undefined && <span className="marcador">{marcador}</span>}
        {onToggle && <span className="text-sm font-semibold text-azul">{abierto ? '▲' : '▼'}</span>}
      </span>
    </>
  );
  const clasesCab = 'flex w-full items-center justify-between gap-2 px-4 py-3 text-left';

  return (
    <section className="tarjeta overflow-hidden">
      {onToggle ? (
        <button type="button" onClick={onToggle} aria-expanded={abierto} className={clasesCab}>
          {cabecera}
        </button>
      ) : (
        <header className={clasesCab}>{cabecera}</header>
      )}
      {abierto && <div className="flex flex-col gap-3 px-4 pb-4">{children}</div>}
    </section>
  );
}
