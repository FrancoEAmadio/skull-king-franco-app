interface Props {
  checked: boolean;
  onChange: (nuevo: boolean) => void;
  disabled?: boolean;
  tamano?: 'md' | 'sm';
}

export function Toggle({ checked, onChange, disabled, tamano = 'md' }: Props) {
  const clasesContenedor =
    tamano === 'sm'
      ? "w-9 h-5 after:h-4 after:w-4"
      : "w-11 h-6 after:h-5 after:w-5";

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
