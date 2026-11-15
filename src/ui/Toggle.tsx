import { vibrar } from '../infra/vibracion';

interface Props {
  checked: boolean;
  onChange: (nuevo: boolean) => void;
  disabled?: boolean;
  etiqueta?: string;
}

/** Interruptor real: un botón con role="switch", área táctil de 44 px. */
export function Toggle({ checked, onChange, disabled, etiqueta }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={etiqueta}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        vibrar();
        onChange(!checked);
      }}
      className="inline-flex h-11 min-w-11 shrink-0 items-center justify-center disabled:opacity-40"
    >
      <span className={`switch ${checked ? 'switch-on' : ''}`} />
    </button>
  );
}
