import { useRef } from 'react';
import type { TouchEvent } from 'react';
import { RATIO_PREDOMINIO_HORIZONTAL, UMBRAL_SWIPE_PX } from '../constantes';

interface OpcionesSwipe {
  onSwipeIzquierda: () => void;
  onSwipeDerecha: () => void;
}

export function useSwipeHorizontal({ onSwipeIzquierda, onSwipeDerecha }: OpcionesSwipe) {
  const inicioRef = useRef({ x: 0, y: 0 });

  const iniciarTouch = (evento: TouchEvent) => {
    const touch = evento.touches[0];
    if (!touch) return;
    inicioRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const finalizarTouch = (evento: TouchEvent) => {
    const touch = evento.changedTouches[0];
    if (!touch) return;

    const deltaX = touch.clientX - inicioRef.current.x;
    const deltaY = touch.clientY - inicioRef.current.y;

    const esHorizontalDominante =
      Math.abs(deltaX) > UMBRAL_SWIPE_PX &&
      Math.abs(deltaX) > Math.abs(deltaY) * RATIO_PREDOMINIO_HORIZONTAL;

    if (!esHorizontalDominante) return;

    if (deltaX < 0) onSwipeIzquierda();
    else onSwipeDerecha();
  };

  return { iniciarTouch, finalizarTouch };
}
