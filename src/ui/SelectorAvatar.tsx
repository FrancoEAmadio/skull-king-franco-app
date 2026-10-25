import { AVATARES } from '../datos/avatares';

interface Props {
  valor: string;
  onCambiar: (emoji: string) => void;
}

export function SelectorAvatar({ valor, onCambiar }: Props) {
  return (
    <div className="grid grid-cols-6 gap-2" role="radiogroup" aria-label="Elegir icono del jugador">
      {AVATARES.map((emoji) => {
        const activo = emoji === valor;
        return (
          <button
            key={emoji}
            type="button"
            role="radio"
            aria-checked={activo}
            onClick={() => onCambiar(emoji)}
            className={`flex aspect-square items-center justify-center rounded-2xl text-3xl ${
              activo ? 'ficha-activa' : 'ficha-inactiva'
            }`}
          >
            {emoji}
          </button>
        );
      })}
    </div>
  );
}
