import { useState } from 'react';
import { useApp } from '../../estado/AppProvider';
import { CATALOGO_CARTAS_WIKI } from '../../datos/cartasDatos';
import { CATEGORIAS_REGLAS_WIKI } from '../../datos/reglasDatos';
import type { ModoContenido } from '../../tipos';
import { useGestosMultiDedo } from '../../ui/useGestosMultiDedo';
import { FichaCarta } from './FichaCarta';
import { Jerarquias } from './Jerarquias';
import { ImagenCarta } from '../../ui/ImagenCarta';

type Vista = 'reglas' | 'jerarquias';

const VISTAS: { id: Vista; etiqueta: string }[] = [
  { id: 'reglas', etiqueta: '📖 Reglas del juego' },
  { id: 'jerarquias', etiqueta: '🧭 Orden de jerarquías' },
];

const MODOS: { id: ModoContenido; etiqueta: string; carta: string }[] = [
  { id: 'base', etiqueta: 'Juego base', carta: 'Juego Base' },
  { id: 'avanzado', etiqueta: 'Reglas avanzadas', carta: 'Reglas Avanzadas' },
  { id: 'expansion', etiqueta: 'Expansión', carta: 'Expansión' },
];

/** Cartas que ilustran cada párrafo de una regla: la foto va justo debajo del párrafo que la nombra. */
const IMAGENES_PARRAFO: [RegExp, string[]][] = [
  [/^PALOS DE COLOR/i, ['palo_amarillo', 'palo_violeta', 'palo_verde']],
  [/^PALO NEGRO/i, ['palo_negro']],
  [/^🏳️ HUÍDA/i, ['huida']],
  [/^⚔️ PIRATAS/i, ['pirata_harry', 'sirena', 'sk']],
  [/^Los piratas no le temen/i, ['kraken']],
  [/^La Ballena Blanca afecta/i, ['ballena']],
  [/^Cuando el Kraken y la Ballena/i, ['kraken', 'ballena']],
  [/^Cuando juegas una carta de Botín/i, ['botin']],
  [/^El Mono 15/i, ['monito15']],
  [/^🏴‍☠️ MARY THORNE/i, ['mary_thorne']],
  [/^🧤 PRIMER OFICIAL KONG/i, ['kong']],
  [/^🐟 MANTARRAYA/i, ['raya_moteada']],
  [/^👻 DAVY JONES/i, ['davy_jones']],
  [/^💣 ÚLTIMA DESCARGA/i, ['last_volley']],
  [/^🪵 CAMINAR POR LA TABLA/i, ['tablon']],
  [/^Si al recibir tu mano inicial/i, ['carta_blanca_base']],
];

function cartasDelParrafo(parrafo: string): string[] {
  return IMAGENES_PARRAFO.find(([re]) => re.test(parrafo.trim()))?.[1] ?? [];
}

export function PantallaReglas() {
  const { setPantallaActual, partida } = useApp();
  const [vista, setVista] = useState<Vista>('reglas');
  const [modo, setModo] = useState<ModoContenido>(partida.hayPartidaGuardada ? partida.configuracionMesa.modoContenido : 'base');
  const [acordeonAbierto, setAcordeonAbierto] = useState<string | null>('general');
  const [reglasAbiertas, setReglasAbiertas] = useState<Record<string, boolean>>({});
  const [ficha, setFicha] = useState<{ ids: string[]; titulo: string } | null>(null);

  const abrir = (ids: string[], titulo?: string) =>
    setFicha({ ids, titulo: titulo ?? CATALOGO_CARTAS_WIKI.find((c) => c.id === ids[0])?.nombre ?? 'Carta' });

  const [dirModo, setDirModo] = useState<1 | -1>(1);
  const [dirVista, setDirVista] = useState<1 | -1>(1);
  const irAModo = (id: ModoContenido) => {
    const nuevo = MODOS.findIndex((m) => m.id === id);
    const actual = MODOS.findIndex((m) => m.id === modo);
    if (nuevo === actual) return;
    setDirModo(nuevo > actual ? 1 : -1);
    setModo(id);
  };
  const irAVista = (id: Vista) => {
    const nuevo = VISTAS.findIndex((v) => v.id === id);
    const actual = VISTAS.findIndex((v) => v.id === vista);
    if (nuevo === actual) return;
    setDirVista(nuevo > actual ? 1 : -1);
    setVista(id);
  };
  const cambiarModo = (dir: 1 | -1) => {
    const i = MODOS.findIndex((m) => m.id === modo) + dir;
    if (i >= 0 && i < MODOS.length) irAModo(MODOS[i]!.id);
  };
  const cambiarVista = (dir: 1 | -1) => {
    const i = VISTAS.findIndex((v) => v.id === vista) + dir;
    if (i >= 0 && i < VISTAS.length) irAVista(VISTAS[i]!.id);
  };
  const animModo = dirModo > 0 ? 'entra-derecha' : 'entra-izquierda';
  const animVista = dirVista > 0 ? 'entra-derecha' : 'entra-izquierda';
  // Dos dedos: cambia de modo. Tres dedos: cambia de sección. Un dedo nunca desliza.
  const gestos = useGestosMultiDedo({ dos: cambiarModo, tres: cambiarVista });

  const botonesModo = (
    <div className="grid grid-cols-3 gap-2">
      {MODOS.map((m) => (
        <button
          key={m.id}
          type="button"
          aria-pressed={modo === m.id}
          onClick={() => irAModo(m.id)}
          className={`min-h-12 px-1 py-2 text-xs font-extrabold leading-tight ${modo === m.id ? 'opcion opcion-sel' : 'opcion'}`}
        >
          {m.etiqueta}
        </button>
      ))}
    </div>
  );

  const cartasDelModo = CATALOGO_CARTAS_WIKI.filter((c) => c.modo === MODOS.find((m) => m.id === modo)!.carta);

  return (
    <main className="entrar flex w-full flex-1 flex-col gap-4 pb-4" {...gestos}>
      {/* Menú fijo: queda a la vista al scrollear */}
      <div className="sticky top-0 z-20 sangrado flex flex-col gap-2 bg-noche-2/95 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] shadow-lg shadow-black/20 backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          <button type="button" onClick={() => setPantallaActual('inicio')} className="btn-fantasma px-3 py-2 text-sm">
            ← Menú
          </button>
          <h2 className="font-display text-lg font-black text-white">Manual y cartas</h2>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {VISTAS.map((v) => (
            <button
              key={v.id}
              type="button"
              aria-pressed={vista === v.id}
              onClick={() => irAVista(v.id)}
              className={`min-h-12 px-1 py-2 text-xs leading-tight ${vista === v.id ? 'btn-primario' : 'btn-fantasma'}`}
            >
              {v.etiqueta}
            </button>
          ))}
        </div>
        {vista === 'jerarquias' && botonesModo}
      </div>

      {vista === 'reglas' && (
        <div key="reglas" className={`flex flex-col gap-2.5 ${animVista}`}>
          {CATEGORIAS_REGLAS_WIKI.map((categoria) => {
            const abierta = acordeonAbierto === categoria.id;
            return (
              <div key={categoria.id} className="overflow-hidden rounded-xl border border-white/20">
                <button
                  type="button"
                  onClick={() => setAcordeonAbierto(abierta ? null : categoria.id)}
                  aria-expanded={abierta}
                  className={`flex min-h-12 w-full items-center justify-between px-4 py-3 text-left text-sm font-black ${abierta ? 'bg-[#ead9b4] text-azul' : 'bg-white text-azul'}`}
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
                          {abiertaRegla && (
                            <div className="mt-1 flex flex-col gap-2 rounded-lg bg-slate-50 p-3">
                              {regla.texto.split('\n\n').map((parrafo, pIdx) => {
                                const cartas = cartasDelParrafo(parrafo);
                                return (
                                  <div key={pIdx} className="flex flex-col gap-2">
                                    <p className="whitespace-pre-line text-xs leading-relaxed">{parrafo}</p>
                                    {cartas.length > 0 && (
                                      <div className="flex flex-wrap justify-center gap-3">
                                        {cartas.map((id) => {
                                          const c = CATALOGO_CARTAS_WIKI.find((x) => x.id === id);
                                          return c ? (
                                            <button key={id} type="button" onClick={() => abrir([id])} aria-label={`Ver ${c.nombre}`}>
                                              <ImagenCarta src={`./${c.imagen}`} alt={c.nombre} className="h-24 rounded-md border border-slate-200 bg-white object-contain shadow" />
                                            </button>
                                          ) : null;
                                        })}
                                      </div>
                                    )}
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
              </div>
            );
          })}

          {/* Catálogo de cartas: subsección de las reglas, solo con las cartas propias de cada modo */}
          <div className="overflow-hidden rounded-xl border border-white/20">
            <button
              type="button"
              onClick={() => setAcordeonAbierto(acordeonAbierto === 'catalogo' ? null : 'catalogo')}
              aria-expanded={acordeonAbierto === 'catalogo'}
              className={`flex min-h-12 w-full items-center justify-between px-4 py-3 text-left text-sm font-black ${acordeonAbierto === 'catalogo' ? 'bg-[#ead9b4] text-azul' : 'bg-white text-azul'}`}
            >
              <span>5. Catálogo de cartas</span>
              <span>{acordeonAbierto === 'catalogo' ? '▲' : '▼'}</span>
            </button>
            {acordeonAbierto === 'catalogo' && (
              <div className="flex flex-col gap-3 bg-white p-3">
                {botonesModo}
                <p className="text-xs text-slate-500">
                  {modo === 'base' ? 'Cartas del juego base.' : modo === 'avanzado' ? 'Solo lo que suman las reglas avanzadas.' : 'Solo lo que suma la expansión.'} Tocá una carta para ver su detalle.
                </p>
                <div key={modo} className={`grid grid-cols-3 gap-2.5 ${animModo}`}>
                  {cartasDelModo.map((c) => (
                    <button key={c.id} type="button" onClick={() => abrir([c.id])} className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-2">
                      <ImagenCarta src={`./${c.imagen}`} alt={c.nombre} className="h-24 rounded-md border border-slate-200 bg-white object-contain" />
                      <span className="text-center text-[11px] font-bold leading-tight text-tinta">{c.nombre}</span>
                    </button>
                  ))}
                </div>
                {modo === 'expansion' && <p className="text-xs font-semibold text-amber-700">Fotos de las cartas 7, 8 y 0/14: próximamente.</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {vista === 'jerarquias' && (
        <div key={`j-${modo}`} className={animModo}>
          <Jerarquias modo={modo} />
        </div>
      )}

      <FichaCarta ids={ficha?.ids ?? null} titulo={ficha?.titulo ?? ''} onCerrar={() => setFicha(null)} />
    </main>
  );
}
