import { useMemo, useState } from 'react';
import { useApp } from '../../estado/AppProvider';
import { CATALOGO_CARTAS_WIKI } from '../../datos/cartasDatos';
import { CATEGORIAS_REGLAS_WIKI } from '../../datos/reglasDatos';
import type { CartaWiki } from '../../tipos';

type Vista = 'manual' | 'cartas';
type FiltroCarta = 'Todos' | CartaWiki['modo'];

const FILTROS: FiltroCarta[] = ['Todos', 'Juego Base', 'Reglas Avanzadas', 'Expansión'];

function iconoModo(modo: CartaWiki['modo']): string {
  if (modo === 'Juego Base') return '🟢';
  if (modo === 'Reglas Avanzadas') return '🟣';
  return '🟠';
}

function estiloBadgeModo(modo: CartaWiki['modo']): string {
  if (modo === 'Juego Base') return 'bg-emerald-950 text-emerald-300 border-emerald-800';
  if (modo === 'Reglas Avanzadas') return 'bg-purple-950 text-purple-300 border-purple-800';
  return 'bg-amber-950 text-amber-300 border-amber-800';
}

export function PantallaReglas() {
  const { setPantallaActual } = useApp();
  const [vista, setVista] = useState<Vista>('manual');
  const [acordeonAbierto, setAcordeonAbierto] = useState<string | null>('general');
  const [reglasAbiertas, setReglasAbiertas] = useState<Record<string, boolean>>({});
  const [termino, setTermino] = useState('');
  const [filtro, setFiltro] = useState<FiltroCarta>('Todos');

  const cartasFiltradas = useMemo(() => {
    const busqueda = termino.toLowerCase();
    return CATALOGO_CARTAS_WIKI.filter((carta) => {
      const coincideTexto =
        carta.nombre.toLowerCase().includes(busqueda) ||
        carta.descripcion.toLowerCase().includes(busqueda);
      const coincideFiltro = filtro === 'Todos' || carta.modo === filtro;
      return coincideTexto && coincideFiltro;
    });
  }, [termino, filtro]);

  const toggleAcordeon = (id: string) =>
    setAcordeonAbierto((actual) => (actual === id ? null : id));

  const toggleRegla = (clave: string) =>
    setReglasAbiertas((actual) => ({ ...actual, [clave]: !actual[clave] }));

  return (
    <main className="py-6 overflow-y-auto w-full">
      <button
        onClick={() => setPantallaActual('inicio')}
        className="mb-4 text-sm text-amber-300 font-bold"
      >
        ← Volver al menú
      </button>
      <h2 className="text-2xl font-bold mb-1 text-white">Manual y Jerarquía del Juego</h2>
      <p className="text-xs text-slate-300 mb-4">Organizado por categorías y expansiones</p>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => setVista('manual')}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs border ${vista === 'manual' ? 'btn-blanco-marron' : 'btn-marron-oscuro'}`}
        >
          📖 Reglas del Juego
        </button>
        <button
          onClick={() => setVista('cartas')}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs border ${vista === 'cartas' ? 'btn-blanco-marron' : 'btn-marron-oscuro'}`}
        >
          🃏 Catálogo de Cartas
        </button>
      </div>

      {vista === 'manual' ? (
        <div className="flex flex-col gap-2.5">
          {CATEGORIAS_REGLAS_WIKI.map((categoria) => (
            <div key={categoria.id} className="border border-slate-800 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleAcordeon(categoria.id)}
                className="w-full p-3.5 bg-slate-900 flex justify-between items-center font-bold text-amber-300 text-sm"
              >
                <span>{categoria.titulo}</span>
                <span>{acordeonAbierto === categoria.id ? '▲' : '▼'}</span>
              </button>
              {acordeonAbierto === categoria.id && (
                <div className="p-4 bg-slate-950 text-xs text-slate-300 flex flex-col gap-3 border-t border-slate-800">
                  {categoria.items.map((regla, idx) => {
                    const clave = `${categoria.id}-${idx}`;
                    const abierta = reglasAbiertas[clave] ?? false;
                    return (
                      <div key={clave} className="border-b border-slate-800/60 pb-3 last:border-none last:pb-0">
                        <button
                          onClick={() => toggleRegla(clave)}
                          className="w-full text-left font-bold text-white flex justify-between items-center py-1"
                        >
                          <span>{regla.titulo}</span>
                          <span className="text-[10px] text-amber-400 font-normal">
                            {abierta ? '−' : '+'}
                          </span>
                        </button>
                        {abierta && (
                          <div className="mt-2 text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                            <p className="leading-relaxed whitespace-pre-line">{regla.texto}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="relative flex items-center">
              <input
                value={termino}
                onChange={(e) => setTermino(e.target.value.trimStart())}
                onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                type="text"
                placeholder="🔍 Buscar carta..."
                className="w-full rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white bg-slate-900 border border-slate-700 focus:outline-none focus:border-amber-500"
              />
              {termino.length > 0 && (
                <button
                  onClick={() => setTermino('')}
                  className="absolute right-2.5 flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scroll-oculto">
              {FILTROS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFiltro(f)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap ${
                    filtro === f
                      ? 'btn-blanco-marron text-black'
                      : 'bg-slate-900 border border-slate-800 text-slate-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {cartasFiltradas.map((carta) => (
              <article key={carta.id} className="tarjeta-marron p-3.5 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${estiloBadgeModo(carta.modo)}`}
                  >
                    {iconoModo(carta.modo)} {carta.modo}
                  </span>
                  <span className="text-xs font-bold text-slate-400">Cantidad: {carta.cantidad}</span>
                </div>
                <div className="flex gap-3 items-start">
                  <img
                    src={`./${carta.imagen}`}
                    alt={carta.nombre}
                    className="w-16 h-22 object-cover rounded-lg border border-slate-700 bg-slate-900 shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-extrabold text-white">{carta.nombre}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{carta.descripcion}</p>
                    {carta.habilidad && (
                      <p className="text-xs text-amber-300 font-semibold mt-1 bg-amber-950/30 p-1.5 rounded border border-amber-900/40">
                        ⚡ {carta.habilidad}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
