interface Props {
  checked: boolean;
  onChange: (nuevo: boolean) => void;
  disabled?: boolean;
  tamano?: 'md' | 'sm';
}

export function Toggle({ checked, onChange, disabled, tamano = 'md' }: Props) {
  const clasesContenedor =
    tamano === 'sm'
      ? "w-12 h-7 after:h-6 after:w-6"
      : "w-[3.75rem] h-8 after:h-7 after:w-7";

  return (
    <div className="relative inline-flex items-center">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div
        className={`${clasesContenedor} bg-slate-800 border border-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:transition-all peer-checked:bg-amber-500`}
      />
    </div>
  );
}
