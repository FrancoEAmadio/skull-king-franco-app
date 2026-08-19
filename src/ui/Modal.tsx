import type { MouseEvent, ReactNode } from 'react';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  children: ReactNode;
  ancho?: string;
  zIndex?: string;
  cerrarAlHacerClickAfuera?: boolean;
}

export function Modal({
  abierto,
  onCerrar,
  children,
  ancho = 'max-w-sm',
  zIndex = 'z-50',
  cerrarAlHacerClickAfuera = false,
}: Props) {
  if (!abierto) return null;

  const handleBackdropClick = (evento: MouseEvent<HTMLDivElement>) => {
    if (!cerrarAlHacerClickAfuera) return;
    if (evento.target === evento.currentTarget) onCerrar();
  };

  return (
    <div
      className={`fixed inset-0 bg-black/85 flex items-center justify-center p-3 ${zIndex} backdrop-blur-sm`}
      onClick={handleBackdropClick}
    >
      <div className={`tarjeta-marron w-full ${ancho} max-h-[90vh] flex flex-col overflow-hidden rounded-2xl`}>
        {children}
      </div>
    </div>
  );
}
