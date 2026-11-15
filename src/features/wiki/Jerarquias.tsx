import { CATALOGO_CARTAS_WIKI } from '../../datos/cartasDatos';
import { DiagramaJerarquia } from '../../ui/DiagramaJerarquia';
import type { FlechaDiagrama, NodoDiagrama } from '../../ui/DiagramaJerarquia';
import type { ModoContenido } from '../../tipos';

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

function EspecialesTriangulo() {
  const piratas = cantidad('pirata_brent') ? ['pirata_brent', 'pirata_rascal', 'pirata_harry', 'pirata_juanita', 'pirata_rosie', 'pirata_tigresa'].length : 6;
  const nodos: NodoDiagrama[] = [
    { id: 'sk', x: 50, y: 20, imgs: [img('sk')], nombre: 'Skull King', color: COLOR.sk },
    { id: 'pi', x: 80, y: 74, imgs: PIRATAS_BASE.map(img), nombre: 'Piratas ×6', color: COLOR.pirata },
    { id: 'si', x: 20, y: 74, imgs: [img('sirena'), img('sirena')], nombre: 'Sirenas ×2', color: COLOR.sirena },
  ];
  const flechas: FlechaDiagrama[] = [
    { de: 'sk', a: 'pi', etiqueta: 'vence · +30 c/u' },
    { de: 'pi', a: 'si', etiqueta: 'vencen · +20' },
    { de: 'si', a: 'sk', etiqueta: 'vencen · +40' },
  ];
  return (
    <Caja titulo="Cartas especiales" texto={`1 Skull King · ${piratas} Piratas · ${cantidad('sirena')} Sirenas`}>
      <DiagramaJerarquia alto={96} nodos={nodos} flechas={flechas} />
    </Caja>
  );
}

function EspecialesCuadrado() {
  const nodos: NodoDiagrama[] = [
    { id: 'sk', x: 22, y: 22, imgs: [img('sk')], nombre: 'Skull King', color: COLOR.sk },
    { id: 'kong', x: 78, y: 22, imgs: [img('kong')], nombre: 'Primer Oficial Kong', color: COLOR.kong },
    { id: 'si', x: 22, y: 78, imgs: [img('sirena'), img('sirena')], nombre: 'Sirenas ×2', color: COLOR.sirena },
    { id: 'pi', x: 78, y: 78, imgs: [...PIRATAS_BASE, 'mary_thorne'].map(img), nombre: 'Piratas ×7', color: COLOR.pirata },
  ];
  const flechas: FlechaDiagrama[] = [
    { de: 'sk', a: 'kong', etiqueta: '+30' },
    { de: 'kong', a: 'pi', etiqueta: 'vence' },
    { de: 'pi', a: 'si', etiqueta: '+20' },
    { de: 'si', a: 'sk', etiqueta: '+40' },
    { de: 'sk', a: 'pi', curva: 0.6, t: 0.28, etiqueta: '+30 c/u' },
    { de: 'si', a: 'kong', curva: 0.6, t: 0.28, etiqueta: '+30' },
  ];
  return (
    <Caja titulo="Cartas especiales" texto="1 Skull King · 1 Kong · 7 Piratas · 2 Sirenas">
      <DiagramaJerarquia alto={100} nodos={nodos} flechas={flechas} />
    </Caja>
  );
}

function Palos({ modo }: { modo: ModoContenido }) {
  const fila = (items: { id: string; nombre: string; archivo: string; color: string }[]) => (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
      {items.map((it) => (
        <div key={it.id} className="flex flex-col items-center gap-1">
          <img src={`./${it.archivo}`} alt="" className="w-16 rounded-md bg-white object-cover shadow" style={{ aspectRatio: '0.7', border: `2px solid ${it.color}` }} />
          <span className="text-center text-[10px] font-black leading-tight" style={{ color: it.color }}>{it.nombre}</span>
        </div>
      ))}
    </div>
  );
  const flecha = (texto: string) => (
    <svg viewBox="0 0 100 14" className="h-7 w-full" aria-hidden="true">
      <defs>
        <marker id="pp" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#1e3a8a" /></marker>
      </defs>
      <line x1="50" y1="0" x2="50" y2="11" stroke="#1e3a8a" strokeWidth="1.2" markerEnd="url(#pp)" />
      <line x1="50" y1="0" x2="50" y2="11" stroke="#f1d36b" strokeWidth="0.8" className="flecha-anim" />
      <text x="56" y="8" fontSize="5" fontWeight="800" fill="#1e3a8a">{texto}</text>
    </svg>
  );
  const archivo = (id: string) => img(id);
  return (
    <Caja titulo="Palos">
      <div className="flex flex-col items-stretch gap-1">
        {fila([{ id: 'n', nombre: 'Palo Negro (triunfo)', archivo: archivo('palo_negro'), color: '#111827' }])}
        {flecha('gana a')}
        {modo === 'expansion' && (
          <>
            {fila([{ id: 'm', nombre: 'Mono Comodín 15', archivo: archivo('monito15'), color: '#b45309' }])}
            {flecha('gana a los 14')}
          </>
        )}
        {fila([
          { id: 'a', nombre: 'Amarillo', archivo: archivo('palo_amarillo'), color: '#ca8a04' },
          { id: 'v', nombre: 'Violeta', archivo: archivo('palo_violeta'), color: '#7c3aed' },
          { id: 'g', nombre: 'Verde', archivo: archivo('palo_verde'), color: '#16a34a' },
        ])}
      </div>
    </Caja>
  );
}

function Monstruos({ modo }: { modo: ModoContenido }) {
  if (modo === 'base') return null;
  if (modo === 'avanzado') {
    const nodos: NodoDiagrama[] = [
      { id: 'kr', x: 24, y: 24, imgs: [img('kraken')], nombre: 'Kraken', color: COLOR.monstruo },
      { id: 'ba', x: 76, y: 24, imgs: [img('ballena')], nombre: 'Ballena Blanca', color: COLOR.monstruo },
    ];
    return (
      <Caja titulo="Monstruos" texto="Entre sí: gana la última que se juega.">
        <DiagramaJerarquia alto={46} nodos={nodos} flechas={[{ de: 'kr', a: 'ba', doble: true, punteada: true }]} />
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
      <DiagramaJerarquia alto={92} nodos={nodos} flechas={flechas} />
    </Caja>
  );
}

function SinBazas({ modo }: { modo: ModoContenido }) {
  const lista = [
    { id: 'huida', nombre: 'Huida', frase: 'Pierde contra todo: te salva de ganar una baza.', ok: true },
    { id: 'botin', nombre: 'Botín', frase: 'Te permite aliarte con otro jugador.', ok: modo !== 'base' },
    { id: 'tablon', nombre: 'Caminar por la Tabla', frase: 'Elimina a un pirata de la baza: ese pirata no gana.', ok: modo === 'expansion' },
    { id: 'last_volley', nombre: 'La Última Descarga', frase: 'Quien la juega tira una segunda carta en la misma baza.', ok: modo === 'expansion' },
  ].filter((c) => c.ok);
  return (
    <Caja titulo="No ganan bazas: tienen habilidades durante la ronda">
      <div className="grid grid-cols-2 gap-2.5">
        {lista.map((c) => (
          <div key={c.id} className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-center">
            <img src={`./${img(c.id)}`} alt="" className="w-14 rounded-md bg-white object-cover shadow" style={{ aspectRatio: '0.7' }} />
            <span className="text-xs font-black text-azul">{c.nombre}</span>
            <span className="text-[11px] leading-tight text-slate-600">{c.frase}</span>
          </div>
        ))}
      </div>
    </Caja>
  );
}

export function Jerarquias({ modo }: { modo: ModoContenido }) {
  return (
    <div className="flex flex-col gap-3">
      {modo === 'expansion' ? <EspecialesCuadrado /> : <EspecialesTriangulo />}
      <Palos modo={modo} />
      <Monstruos modo={modo} />
      <SinBazas modo={modo} />
    </div>
  );
}
