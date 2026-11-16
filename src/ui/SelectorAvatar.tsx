import { AVATARES, urlAvatar } from '../datos/avatares';

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
            className={`flex aspect-square items-center justify-center rounded-2xl p-1.5 ${
              activo ? 'ficha-activa' : 'ficha-inactiva'
            }`}
          >
            <img src={urlAvatar(emoji)} alt="" loading="lazy" draggable={false} className="h-full w-full select-none object-contain" />
          </button>
        );
      })}
    </div>
  );
}
