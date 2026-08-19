interface Props {
  valor: number;
  onDecrementar: () => void;
  onIncrementar: () => void;
  decrementarDisabled?: boolean;
  incrementarDisabled?: boolean;
  colorValor?: string;
  tamanoBoton?: 'sm' | 'md';
}

export function ContadorMasMenos({
  valor,
  onDecrementar,
  onIncrementar,
  decrementarDisabled,
  incrementarDisabled,
  colorValor = 'text-amber-300',
  tamanoBoton = 'md',
}: Props) {
  const clasesBoton = tamanoBoton === 'sm' ? 'w-8 h-8 text-sm' : 'w-9 h-9';
  const tamanoValor = tamanoBoton === 'sm' ? 'text-lg' : 'text-2xl';

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onDecrementar}
        disabled={decrementarDisabled}
        className={`${clasesBoton} btn-marron-oscuro rounded-lg font-bold disabled:opacity-20`}
      >
        -
      </button>
      <span className={`w-10 text-center ${tamanoValor} font-black ${colorValor}`}>{valor}</span>
      <button
        onClick={onIncrementar}
        disabled={incrementarDisabled}
        className={`${clasesBoton} btn-blanco-marron rounded-lg font-bold text-black disabled:opacity-20`}
      >
        +
      </button>
    </div>
  );
}
