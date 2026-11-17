import { CATALOGO_CARTAS_WIKI } from '../../datos/cartasDatos';
import { DiagramaJerarquia } from '../../ui/DiagramaJerarquia';
import type { FlechaDiagrama, NodoDiagrama } from '../../ui/DiagramaJerarquia';
import type { ModoContenido } from '../../tipos';
import { useState } from 'react';
import { FichaCarta } from './FichaCarta';
import { ModalFeedback } from '../ajustes/ModalFeedback';

type OnFicha = (ids: string[], titulo: string) => void;
const PIRATAS6 = ['pirata_brent', 'pirata_rascal', 'pirata_harry', 'pirata_juanita', 'pirata_rosie', 'pirata_tigresa'];
const PIRATAS7 = [...PIRATAS6, 'mary_thorne'];

const img = (id: string) => CATALOGO_CARTAS_WIKI.find((c) => c.id === id)?.imagen ?? '';
const cantidad = (id: string) => Number.parseInt(CATALOGO_CARTAS_WIKI.find((c) => c.id === id)?.cantidad ?? '0', 10) || 0;

const COLOR = { sk: '#1f2937', pirata: '#dc2626', sirena: '#0d9488', kong: '#ea580c', monstruo: '#7c3aed', davy: '#0369a1' };

const PIRATAS_BASE = ['pirata_brent', 'pirata_tigresa', 'pirata_juanita'];

function Caja({ titulo, texto, children }: { titulo: string; texto?: string; children: React.ReactNode }) {
  return (
    <section className="tarjeta flex flex-col gap-2 p-4">
      <h3 className="tarjeta-titulo">{titulo}</h3>
      {texto && <p className="text-xs font-semibold text-slate-500">{texto}</p>}
      {children}
    </section>
  );
}

function EspecialesTriangulo({ onFicha }: { onFicha: OnFicha }) {
  const piratas = cantidad('pirata_brent') ? ['pirata_brent', 'pirata_rascal', 'pirata_harry', 'pirata_juanita', 'pirata_rosie', 'pirata_tigresa'].length : 6;
  const nodos: NodoDiagrama[] = [
    { id: 'sk', x: 50, y: 20, imgs: [img('sk')], nombre: 'Skull King', color: COLOR.sk },
    { id: 'pi', x: 80, y: 74, imgs: PIRATAS_BASE.map(img), nombre: 'Piratas ×6', color: COLOR.pirata },
    { id: 'si', x: 20, y: 74, imgs: [img('sirena'), img('sirena')], nombre: 'Sirenas ×2', color: COLOR.sirena },
  ];
  const flechas: FlechaDiagrama[] = [
    { de: 'sk', a: 'pi', etiqueta: 'vence · +30 c/u', color: COLOR.sk },
    { de: 'pi', a: 'si', etiqueta: 'vencen · +20', color: COLOR.pirata },
    { de: 'si', a: 'sk', etiqueta: 'vencen · +40', color: COLOR.sirena },
  ];
  return (
    <Caja titulo="Cartas especiales" texto={`1 Skull King · ${piratas} Piratas · ${cantidad('sirena')} Sirenas`}>
      <DiagramaJerarquia
        alto={96}
        nodos={nodos}
        flechas={flechas}
        onTocar={(id) => onFicha(id === 'sk' ? ['sk'] : id === 'si' ? ['sirena'] : PIRATAS6, id === 'sk' ? 'Skull King' : id === 'si' ? 'Sirenas' : 'Piratas')}
      />
    </Caja>
  );
}

function EspecialesCuadrado({ onFicha }: { onFicha: OnFicha }) {
  const nodos: NodoDiagrama[] = [
    { id: 'sk', x: 22, y: 22, imgs: [img('sk')], nombre: 'Skull King', color: COLOR.sk },
    { id: 'kong', x: 78, y: 22, imgs: [img('kong')], nombre: 'Kong', color: COLOR.kong },
    { id: 'si', x: 22, y: 78, imgs: [img('sirena'), img('sirena')], nombre: 'Sirenas ×2', color: COLOR.sirena },
    { id: 'pi', x: 78, y: 78, imgs: [...PIRATAS_BASE, 'mary_thorne'].map(img), nombre: 'Piratas ×7', color: COLOR.pirata },
  ];
  const flechas: FlechaDiagrama[] = [
    { de: 'sk', a: 'kong', etiqueta: '+30', color: COLOR.sk },
    { de: 'kong', a: 'pi', etiqueta: 'vence', color: COLOR.kong },
    { de: 'pi', a: 'si', etiqueta: '+20', color: COLOR.pirata },
    { de: 'si', a: 'sk', etiqueta: '+40', color: COLOR.sirena },
    { de: 'sk', a: 'pi', curva: 0.6, t: 0.2, etiqueta: '+30 c/u', color: COLOR.sk },
    { de: 'si', a: 'kong', curva: 0.6, t: 0.2, etiqueta: '+30', color: COLOR.sirena },
  ];
  return (
    <Caja titulo="Cartas especiales" texto="1 Skull King · 1 Kong · 7 Piratas · 2 Sirenas">
      <DiagramaJerarquia
        alto={100}
        nodos={nodos}
        flechas={flechas}
        onTocar={(id) =>
          onFicha(id === 'sk' ? ['sk'] : id === 'si' ? ['sirena'] : id === 'kong' ? ['kong'] : PIRATAS7, id === 'sk' ? 'Skull King' : id === 'si' ? 'Sirenas' : id === 'kong' ? 'Primer Oficial Kong' : 'Piratas')
        }
      />
    </Caja>
  );
}

function Palos({ modo, onFicha }: { modo: ModoContenido; onFicha: OnFicha }) {
  const fila = (items: { id: string; nombre: string; archivo: string; color: string; carta: string }[]) => (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
      {items.map((it) => (
        <button type="button" key={it.id} onClick={() => onFicha([it.carta], it.nombre)} className="flex flex-col items-center gap-1">
          <img src={`./${it.archivo}`} alt="" className="w-16 rounded-md bg-white object-cover shadow" style={{ aspectRatio: '0.7', border: `2px solid ${it.color}` }} />
          <span className="text-center text-[10px] font-bold leading-tight" style={{ color: it.color }}>{it.nombre}</span>
        </button>
      ))}
    </div>
  );
  const flecha = (texto: string) => (
    <svg viewBox="0 0 100 14" className="h-7 w-full" aria-hidden="true">
      <defs>
        <marker id="pp" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#5a3d1e" /></marker>
      </defs>
      <line x1="50" y1="0" x2="50" y2="11" stroke="#5a3d1e" strokeWidth="1.2" markerEnd="url(#pp)" />
      <line x1="50" y1="0" x2="50" y2="11" stroke="#f1d36b" strokeWidth="0.8" className="flecha-anim" />
      <text x="56" y="8" fontSize="5" fontWeight="800" fill="#5a3d1e">{texto}</text>
    </svg>
  );
  const archivo = (id: string) => img(id);
  const expansion = modo === 'expansion';
  // Una carta arriba y los tres palos en la misma fila, igual que en Monstruos: ninguno es mejor que otro.
  const cima: NodoDiagrama = expansion
    ? { id: 'm', x: 50, y: 18, imgs: [archivo('monito15')], nombre: 'Mono Comodín 15', color: '#b45309' }
    : { id: 'n', x: 50, y: 18, imgs: [archivo('palo_negro')], nombre: 'Palo Negro (triunfo)', color: '#111827' };
  const nodos: NodoDiagrama[] = [
    cima,
    { id: 'a', x: 17, y: 72, imgs: [archivo('palo_amarillo')], nombre: 'Amarillo', color: '#ca8a04' },
    { id: 'v', x: 50, y: 72, imgs: [archivo('palo_violeta')], nombre: 'Violeta', color: '#7c3aed' },
    { id: 'g', x: 83, y: 72, imgs: [archivo('palo_verde')], nombre: 'Verde', color: '#16a34a' },
  ];
  const flechas: FlechaDiagrama[] = ['a', 'v', 'g'].map((destino) => ({
    de: cima.id,
    a: destino,
    color: cima.color,
    ...(expansion && destino === 'v' ? { etiqueta: 'gana a los 14' } : {}),
  }));
  const idCarta: Record<string, [string, string]> = {
    n: ['palo_negro', 'Palo Negro'], m: ['monito15', 'Mono Comodín 15'],
    a: ['palo_amarillo', 'Amarillo'], v: ['palo_violeta', 'Violeta'], g: ['palo_verde', 'Verde'],
  };
  return (
    <Caja titulo="Palos">
      <div className="flex flex-col items-stretch gap-1">
        {expansion && (
          <>
            {fila([{ carta: 'palo_negro', id: 'n', nombre: 'Palo Negro (triunfo)', archivo: archivo('palo_negro'), color: '#111827' }])}
            {flecha('gana a')}
          </>
        )}
        <DiagramaJerarquia
          alto={92}
          nodos={nodos}
          flechas={flechas}
          onTocar={(id) => onFicha([idCarta[id]![0]], idCarta[id]![1])}
        />
        <p className="text-center text-xs font-semibold text-slate-500">Entre sí no hay uno mejor: gana el palo declarado, el de la primera carta de la baza.</p>
      </div>
    </Caja>
  );
}

function Monstruos({ modo, onFicha }: { modo: ModoContenido; onFicha: OnFicha }) {
  const ID: Record<string, string> = { kr: 'kraken', ba: 'ballena', ra: 'raya_moteada', dj: 'davy_jones' };
  const tocar = (id: string) => onFicha([ID[id]!], CATALOGO_CARTAS_WIKI.find((c) => c.id === ID[id])?.nombre ?? '');
  if (modo === 'base') return null;
  if (modo === 'avanzado') {
    const nodos: NodoDiagrama[] = [
      { id: 'kr', x: 24, y: 24, imgs: [img('kraken')], nombre: 'Kraken', color: COLOR.monstruo },
      { id: 'ba', x: 76, y: 24, imgs: [img('ballena')], nombre: 'Ballena Blanca', color: COLOR.monstruo },
    ];
    return (
      <Caja titulo="Monstruos" texto="Entre sí: gana la última que se juega.">
        <DiagramaJerarquia alto={46} nodos={nodos} onTocar={tocar} flechas={[{ de: 'kr', a: 'ba', doble: true, punteada: true }]} />
      </Caja>
    );
  }
  const nodos: NodoDiagrama[] = [
    { id: 'dj', x: 50, y: 18, imgs: [img('davy_jones')], nombre: 'Davy Jones', color: COLOR.davy },
    { id: 'kr', x: 17, y: 72, imgs: [img('kraken')], nombre: 'Kraken', color: COLOR.monstruo },
    { id: 'ba', x: 50, y: 72, imgs: [img('ballena')], nombre: 'Ballena Blanca', color: COLOR.monstruo },
    { id: 'ra', x: 83, y: 72, imgs: [img('raya_moteada')], nombre: 'Mantarraya', color: COLOR.monstruo },
  ];
  const flechas: FlechaDiagrama[] = [
    { de: 'dj', a: 'kr' },
    { de: 'dj', a: 'ba' },
    { de: 'dj', a: 'ra' },
    { de: 'kr', a: 'ba', doble: true, punteada: true },
    { de: 'ba', a: 'ra', doble: true, punteada: true },
  ];
  return (
    <Caja titulo="Monstruos" texto="Davy Jones destruye monstruos (+20 c/u). Entre sí: gana la última que se juega.">
      <DiagramaJerarquia alto={92} nodos={nodos} flechas={flechas} onTocar={tocar} />
    </Caja>
  );
}

function SinBazas({ modo, onFicha }: { modo: ModoContenido; onFicha: OnFicha }) {
  const lista = [
    { id: 'huida', nombre: 'Huida', frase: 'Pierde contra todo: te salva de ganar una baza.', ok: true },
    { id: 'pirata_tigresa', nombre: 'Tigresa', frase: 'Pirata que también puede jugarse como huida: ahí pierde.', ok: true },
    { id: 'botin', nombre: 'Botín', frase: 'Te permite aliarte con otro jugador.', ok: modo !== 'base' },
    { id: 'tablon', nombre: 'Caminar por la Tabla', frase: 'Elimina a un pirata de la baza: ese pirata no gana.', ok: modo === 'expansion' },
    { id: 'last_volley', nombre: 'La Última Descarga', frase: 'Quien la juega tira una segunda carta en la misma baza.', ok: modo === 'expansion' },
  ].filter((c) => c.ok);
  return (
    <Caja titulo="No ganan bazas: tienen habilidades durante la ronda">
      <div className="flex flex-wrap justify-center gap-2.5">
        {lista.map((c) => (
          <button type="button" key={c.id} onClick={() => onFicha([c.id], c.nombre)} className="flex w-[47%] flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-center">
            <img src={`./${img(c.id)}`} alt="" className="w-14 rounded-md bg-white object-cover shadow" style={{ aspectRatio: '0.7' }} />
            <span className="text-xs font-bold text-azul">{c.nombre}</span>
            <span className="text-[11px] leading-tight text-slate-600">{c.frase}</span>
          </button>
        ))}
      </div>
    </Caja>
  );
}

function Preguntas({ modo }: { modo: ModoContenido }) {
  const [abierto, setAbierto] = useState(false);
  const [preguntando, setPreguntando] = useState(false);
  const faq = [
    ['¿Y si se juegan Pirata, Sirena y Skull King en la misma baza?', 'Gana la Sirena, sin importar en qué orden se jugaron.'],
    ...(modo === 'expansion' ? [['¿Y con el Primer Oficial Kong?', 'Sigue ganando la Sirena.']] : []),
    ['¿Y si todos juegan Huida?', 'Gana la primera Huida que se jugó.'],
    ['¿Una carta de otro color le gana al palo declarado?', 'No, aunque sea más alta. Solo ganan el Palo Negro o las cartas especiales.'],
  ];
  return (
    <section className="tarjeta overflow-hidden">
      <button type="button" onClick={() => setAbierto(!abierto)} aria-expanded={abierto} className="flex min-h-12 w-full items-center justify-between px-4 py-3 text-left">
        <h3 className="tarjeta-titulo !font-sans">Preguntas frecuentes</h3>
        <span className="text-sm font-semibold text-azul">{abierto ? '▲' : '▼'}</span>
      </button>
      {abierto && (
        <dl className="flex flex-col gap-3 px-4 pb-4">
          {faq.map(([p, r]) => (
            <div key={p}>
              <dt className="text-sm font-semibold text-tinta">{p}</dt>
              <dd className="text-sm text-slate-600">{r}</dd>
            </div>
          ))}
        </dl>
      )}
      {abierto && (
        <div className="flex flex-col gap-2 border-t border-slate-100 px-4 py-3">
          <p className="text-sm text-slate-600">¿Querés hacer una pregunta que no está respondida acá? Escribinos tu pregunta y la agregamos.</p>
          <button type="button" onClick={() => setPreguntando(true)} className="btn-primario w-full py-3 text-sm !text-white">
            Hacer una pregunta
          </button>
        </div>
      )}
      <ModalFeedback abierto={preguntando} onCerrar={() => setPreguntando(false)} />
    </section>
  );
}

export function Jerarquias({ modo }: { modo: ModoContenido }) {
  const [ficha, setFicha] = useState<{ ids: string[]; titulo: string } | null>(null);
  const onFicha: OnFicha = (ids, titulo) => setFicha({ ids, titulo });
  return (
    <div className="flex flex-col gap-3">
      {modo === 'expansion' ? <EspecialesCuadrado onFicha={onFicha} /> : <EspecialesTriangulo onFicha={onFicha} />}
      <Palos modo={modo} onFicha={onFicha} />
      <Monstruos modo={modo} onFicha={onFicha} />
      <SinBazas modo={modo} onFicha={onFicha} />
      <Preguntas modo={modo} />
      <FichaCarta ids={ficha?.ids ?? null} titulo={ficha?.titulo ?? ''} onCerrar={() => setFicha(null)} />
    </div>
  );
}
