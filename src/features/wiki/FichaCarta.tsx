import { CATALOGO_CARTAS_WIKI } from '../../datos/cartasDatos';
import { EncabezadoModal, Modal } from '../../ui/Modal';

function Campo({ etiqueta, texto }: { etiqueta: string; texto: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-[10px] font-black uppercase tracking-widest text-azul">{etiqueta}</dt>
      <dd className="text-sm leading-snug text-slate-700">{texto}</dd>
    </div>
  );
}

interface Props {
  ids: string[] | null;
  titulo: string;
  onCerrar: () => void;
}

/** Ficha con foto grande y descripción detallada de una carta (o de un grupo de cartas). */
export function FichaCarta({ ids, titulo, onCerrar }: Props) {
  const cartas = (ids ?? []).map((id) => CATALOGO_CARTAS_WIKI.find((c) => c.id === id)).filter((c) => !!c);
  return (
    <Modal abierto={!!ids} onCerrar={onCerrar} ancho="max-w-md" cerrarAlHacerClickAfuera zIndex="z-[60]">
      <EncabezadoModal titulo={titulo} onCerrar={onCerrar} />
      <div className="scroll-oculto flex flex-col gap-4 overflow-y-auto bg-slate-50 p-4">
        {cartas.map((c) => (
          <article key={c.id} className="tarjeta flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-lg font-black text-azul">{c.nombre}</h3>
              <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-black text-azul">{c.cantidad}</span>
            </div>
            <div className="flex justify-center rounded-xl bg-gradient-to-b from-amber-50 to-stone-100 p-3">
              <img src={`./${c.imagen}`} alt={c.nombre} className="h-64 rounded-lg border border-slate-200 bg-white object-contain shadow" />
            </div>
            <dl className="flex flex-col gap-2">
              <p className="text-sm text-slate-700">{c.descripcion}</p>
              {c.habilidad && <Campo etiqueta="Habilidad" texto={c.habilidad} />}
              <Campo etiqueta="Gana contra" texto={c.ganaContra} />
              <Campo etiqueta="Pierde contra" texto={c.pierdeContra} />
              {c.bonificacion && <Campo etiqueta="Bonificación" texto={c.bonificacion} />}
            </dl>
          </article>
        ))}
      </div>
    </Modal>
  );
}
