interface Props {
  /** "compacta" para el pie de página; "completa" para el modal de créditos. */
  variante?: 'compacta' | 'completa';
}

/** Sello de autoría: se muestra en el pie de página y en el modal de información. */
export function InsigniaAutoria({ variante = 'compacta' }: Props) {
  if (variante === 'compacta') {
    return (
      <div className="mx-auto flex max-w-full flex-col items-center gap-1 text-center">
        <span className="inline-flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-0.5 rounded-full border border-amber-500/35 bg-amber-500/10 px-3 py-1.5 text-[11px] font-semibold leading-snug text-amber-100">
          <span aria-hidden="true">🏴‍☠️</span>
          <span>Desarrollado por Franco Ezequiel Amadio</span>
        </span>
        <span className="text-[11px] leading-snug text-slate-400">
          Versión Original: Agosto 2026 <span aria-hidden="true">|</span> Edición adaptada para Devir
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-amber-500/35 bg-gradient-to-b from-amber-500/10 to-transparent p-4 text-center">
      <span className="text-2xl" aria-hidden="true">
        🏴‍☠️
      </span>
      <p className="text-sm font-black text-amber-200">Desarrollado por Franco Ezequiel Amadio</p>
      <p className="text-xs leading-relaxed text-slate-300">
        Versión Original: Agosto 2026 <span aria-hidden="true">|</span> Edición adaptada para Devir
      </p>
      <p className="text-[11px] leading-relaxed text-slate-400">
        Colaboración en la versión original: MATEAV23.
      </p>
      <p className="border-t border-slate-800 pt-2 text-[11px] leading-relaxed text-slate-400">
        Proyecto independiente de portfolio. Skull King y su arte pertenecen a sus respectivos titulares
        (Grandpa Beck’s Games y editores); esta aplicación no es un producto oficial.
      </p>
    </div>
  );
}
