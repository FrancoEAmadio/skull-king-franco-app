import { useMemo, useState } from 'react';
import { useApp } from '../../estado/AppProvider';
import { CATALOGO_CARTAS_WIKI } from '../../datos/cartasDatos';
import { CATEGORIAS_REGLAS_WIKI } from '../../datos/reglasDatos';
import type { ModoContenido } from '../../tipos';
import { useSwipeHorizontal } from '../../ui/useSwipeHorizontal';
import { Jerarquias } from './Jerarquias';

type Vista = 'manual' | 'cartas' | 'jerarquias';

const MODOS: { id: ModoContenido; etiqueta: string }[] = [
  { id: 'base', etiqueta: 'Juego base' },
  { id: 'avanzado', etiqueta: 'Reglas avanzadas' },
  { id: 'expansion', etiqueta: 'Expansión' },
];

function permitida(modoCarta: string, modo: ModoContenido): boolean {
  if (modoCarta === 'Juego Base') return true;
  if (modoCarta === 'Reglas Avanzadas') return modo !== 'base';
  return modo === 'expansion';
}

function Campo({ etiqueta, texto }: { etiqueta: string; texto: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-[10px] font-black uppercase tracking-widest text-azul">{etiqueta}</dt>
      <dd className="text-xs leading-snug text-slate-700">{texto}</dd>
    </div>
  );
}

export function PantallaReglas() {
  const { setPantallaActual, partida } = useApp();
  const [vista, setVista] = useState<Vista>('manual');
  const [modo, setModo] = useState<ModoContenido>(partida.hayPartidaGuardada ? partida.configuracionMesa.modoContenido : 'base');
  const [acordeonAbierto, setAcordeonAbierto] = useState<string | null>('general');
  const [reglasAbiertas, setReglasAbiertas] = useState<Record<string, boolean>>({});
  const [termino, setTermino] = useState('');

  // Deslizar a los costados cambia de modo, solo en Catálogo y Jerarquías.
  const indiceModo = MODOS.findIndex((m) => m.id === modo);
  const { iniciarTouch, finalizarTouch } = useSwipeHorizontal({
    onSwipeIzquierda: () => indiceModo < MODOS.length - 1 && setModo(MODOS[indiceModo + 1]!.id),
    onSwipeDerecha: () => indiceModo > 0 && setModo(MODOS[indiceModo - 1]!.id),
  });
  const gestos = vista === 'manual' ? {} : { onTouchStart: iniciarTouch, onTouchEnd: finalizarTouch };

  const cartas = useMemo(() => {
    const q = termino.trim().toLowerCase();
    return CATALOGO_CARTAS_WIKI.filter(
      (c) => permitida(c.modo, modo) && (!q || c.nombre.toLowerCase().includes(q) || c.descripcion.toLowerCase().includes(q))
    );
  }, [termino, modo]);

  const botonesModo = (
    <div className="grid grid-cols-3 gap-2">
      {MODOS.map((m) => (
        <button
          key={m.id}
          type="button"
          aria-pressed={modo === m.id}
          onClick={() => setModo(m.id)}
          className={`min-h-12 px-1 py-2 text-xs font-extrabold leading-tight ${modo === m.id ? 'opcion opcion-sel' : 'opcion'}`}
        >
          {m.etiqueta}
        </button>
      ))}
    </div>
  );

  return (
    <main className="entrar flex w-full flex-1 flex-col gap-4 py-4" {...gestos}>
      <button type="button" onClick={() => setPantallaActual('inicio')} className="btn-fantasma self-start px-3 py-2 text-sm">
        ← Volver al menú
      </button>
      <h2 className="font-display text-2xl font-black text-white">Manual, Cartas y Reglas</h2>

      <div className="grid grid-cols-3 gap-2">
        {(
          [
            ['manual', '📖 Reglas del juego'],
            ['cartas', '🃏 Catálogo de cartas'],
            ['jerarquias', '🧭 Orden de jerarquías'],
          ] as const
        ).map(([id, etiqueta]) => (
          <button
            key={id}
            type="button"
            aria-pressed={vista === id}
            onClick={() => setVista(id)}
            className={`min-h-14 px-1 py-2 text-xs leading-tight ${vista === id ? 'btn-primario' : 'btn-fantasma'}`}
          >
            {etiqueta}
          </button>
        ))}
      </div>

      {vista !== 'manual' && botonesModo}

      {vista === 'manual' && (
        <div className="flex flex-col gap-2.5">
          {CATEGORIAS_REGLAS_WIKI.map((categoria) => {
            const abierta = acordeonAbierto === categoria.id;
            return (
              <div key={categoria.id} className="overflow-hidden rounded-xl border border-white/20">
                <button
                  type="button"
                  onClick={() => setAcordeonAbierto(abierta ? null : categoria.id)}
                  aria-expanded={abierta}
                  className={`flex min-h-12 w-full items-center justify-between px-4 py-3 text-left text-sm font-black ${
                    abierta ? 'bg-azul text-white' : 'bg-white text-azul'
                  }`}
                >
                  <span>{categoria.titulo}</span>
                  <span>{abierta ? '▲' : '▼'}</span>
                </button>
                {abierta && (
                  <div className="flex flex-col gap-2 bg-white p-3 text-sm text-slate-700">
                    {categoria.items.map((regla, idx) => {
                      const clave = `${categoria.id}-${idx}`;
                      const abiertaRegla = reglasAbiertas[clave] ?? false;
                      return (
                        <div key={clave} className="border-b border-slate-100 pb-2 last:border-none last:pb-0">
                          <button
                            type="button"
                            onClick={() => setReglasAbiertas((a) => ({ ...a, [clave]: !a[clave] }))}
                            className="flex min-h-11 w-full items-center justify-between text-left font-bold text-tinta"
                          >
                            <span>{regla.titulo}</span>
                            <span className="px-2 text-azul">{abiertaRegla ? '−' : '+'}</span>
                          </button>
                          {abiertaRegla && <p className="mt-1 whitespace-pre-line rounded-lg bg-slate-50 p-3 text-xs leading-relaxed">{regla.texto}</p>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {vista === 'cartas' && (
        <div className="flex flex-col gap-3">
          <div className="relative flex items-center">
            <input
              value={termino}
              onChange={(e) => setTermino(e.target.value.trimStart())}
              type="text"
              placeholder="🔍 Buscar carta..."
              aria-label="Buscar carta"
              className="campo pr-11"
            />
            {termino.length > 0 && (
              <button
                type="button"
                onClick={() => setTermino('')}
                aria-label="Borrar búsqueda"
                className="absolute right-1.5 flex h-9 w-9 items-center justify-center rounded-full text-slate-500"
              >
                ✕
              </button>
            )}
          </div>
          {cartas.length === 0 && <div className="tarjeta p-6 text-center text-sm text-slate-500">No hay cartas que coincidan.</div>}
          {cartas.map((carta) => (
            <article key={carta.id} className="tarjeta overflow-hidden">
              <div className="flex items-center justify-between gap-2 px-4 pt-3">
                <h3 className="font-display text-base font-black text-azul">{carta.nombre}</h3>
                <span className="shrink-0 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-black text-azul">{carta.cantidad}</span>
              </div>
              <div className="mx-4 mt-2 flex justify-center rounded-xl bg-gradient-to-b from-blue-50 to-slate-100 p-3">
                <img
                  src={`./${carta.imagen}`}
                  alt={carta.nombre}
                  className="h-44 rounded-lg border border-slate-200 bg-white object-contain shadow"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <dl className="flex flex-col gap-2 p-4">
                <p className="text-xs text-slate-600">{carta.descripcion}</p>
                {carta.habilidad && <Campo etiqueta="Habilidad" texto={carta.habilidad} />}
                <Campo etiqueta="Gana contra" texto={carta.ganaContra} />
                <Campo etiqueta="Pierde contra" texto={carta.pierdeContra} />
                {carta.bonificacion && <Campo etiqueta="Bonificación" texto={carta.bonificacion} />}
              </dl>
            </article>
          ))}
        </div>
      )}

      {vista === 'jerarquias' && <Jerarquias modo={modo} />}
    </main>
  );
}
