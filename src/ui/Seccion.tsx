import type { ReactNode } from 'react';

interface Props {
  titulo: string;
  /** Numeración "1.", "2."... que se muestra antes del título. */
  numero?: number;
  /** Dato a la derecha del encabezado (por ejemplo "Envite 2" o "3/3"). */
  marcador?: ReactNode;
  /** Si se pasa onToggle, la sección es un acordeón: el encabezado abre y cierra el contenido. */
  abierto?: boolean;
  onToggle?: () => void;
  children: ReactNode;
}

/** Tarjeta azul noche con encabezado dorado, igual para todos los bloques de la hoja de puntos. */
export function Seccion({ titulo, numero, marcador, abierto = true, onToggle, children }: Props) {
  const cabecera = (
    <>
      <h3>
        {numero !== undefined && <span className="mr-1.5 opacity-60">{numero}.</span>}
        {titulo}
      </h3>
      <span className="flex items-center gap-2">
        {marcador !== undefined && <span className="marcador">{marcador}</span>}
        {onToggle && <span className="text-lg font-bold text-amber-300">{abierto ? '▲' : '▼'}</span>}
      </span>
    </>
  );

  return (
    <section className="tarjeta-marron overflow-hidden">
      {onToggle ? (
        <button type="button" onClick={onToggle} aria-expanded={abierto} className="seccion-cabecera w-full text-left">
          {cabecera}
        </button>
      ) : (
        <header className="seccion-cabecera">{cabecera}</header>
      )}
      {abierto && <div className="flex flex-col gap-3 p-3.5">{children}</div>}
    </section>
  );
}
