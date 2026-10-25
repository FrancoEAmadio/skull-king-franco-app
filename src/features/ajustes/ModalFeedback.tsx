import { useState } from 'react';
import { enviarFeedback, type TipoFeedback } from '../../infra/feedback';
import { Modal } from '../../ui/Modal';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
}

const TIPOS: { id: TipoFeedback; etiqueta: string }[] = [
  { id: 'bug', etiqueta: '🐞 Reportar un error' },
  { id: 'sugerencia', etiqueta: '💡 Sugerencia o comentario' },
];

const MENSAJES_ERROR = {
  sin_clave: 'El envío todavía no está configurado en esta versión de la app.',
  sin_conexion: 'No hay conexión a internet. Probá de nuevo cuando vuelvas a estar en línea.',
  rechazado: 'No se pudo enviar el mensaje. Probá de nuevo en un rato.',
  error_red: 'No se pudo conectar para enviar el mensaje. Revisá tu conexión y probá de nuevo.',
} as const;

type Estado = { fase: 'editando' } | { fase: 'enviando' } | { fase: 'enviado' } | { fase: 'error'; texto: string };

export function ModalFeedback({ abierto, onCerrar }: Props) {
  const [tipo, setTipo] = useState<TipoFeedback>('bug');
  const [nombre, setNombre] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [estado, setEstado] = useState<Estado>({ fase: 'editando' });

  const enviando = estado.fase === 'enviando';
  const puedeEnviar = mensaje.trim().length > 0 && !enviando;

  const cerrar = () => {
    if (enviando) return;
    onCerrar();
    if (estado.fase === 'enviado') {
      setNombre('');
      setMensaje('');
      setTipo('bug');
    }
    setEstado({ fase: 'editando' });
  };

  const enviar = async () => {
    if (!puedeEnviar) return;
    setEstado({ fase: 'enviando' });
    const resultado = await enviarFeedback({ tipo, nombre, mensaje });
    setEstado(resultado.ok ? { fase: 'enviado' } : { fase: 'error', texto: MENSAJES_ERROR[resultado.motivo] });
  };

  return (
    <Modal abierto={abierto} onCerrar={cerrar} ancho="max-w-md" zIndex="z-[70]">
      <div className="flex shrink-0 items-center justify-between border-b border-amber-900/60 bg-slate-900 p-4">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-amber-300">Tu opinión</h3>
          <span className="text-xl font-bold text-white">Comentarios y errores</span>
        </div>
        <button
          type="button"
          onClick={cerrar}
          aria-label="Cerrar"
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-2xl font-bold text-slate-300"
        >
          ✕
        </button>
      </div>

      {estado.fase === 'enviado' ? (
        <>
          <div className="flex flex-col items-center gap-3 p-8 text-center" role="status">
            <span className="text-5xl" aria-hidden="true">
              ✅
            </span>
            <p className="text-lg font-bold leading-relaxed text-white">¡Gracias! Tu mensaje fue enviado.</p>
          </div>
          <div className="border-t border-amber-900/60 p-4">
            <button type="button" onClick={cerrar} className="btn-blanco-marron w-full rounded-2xl py-4 text-lg">
              Cerrar
            </button>
          </div>
        </>
      ) : (
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(evento) => {
            evento.preventDefault();
            void enviar();
          }}
        >
          <div className="scroll-oculto flex flex-1 flex-col gap-4 overflow-y-auto p-4">
            <div className="grid gap-2" role="radiogroup" aria-label="Tipo de mensaje">
              {TIPOS.map((opcion) => {
                const activo = tipo === opcion.id;
                return (
                  <button
                    key={opcion.id}
                    type="button"
                    role="radio"
                    aria-checked={activo}
                    disabled={enviando}
                    onClick={() => setTipo(opcion.id)}
                    className={`${activo ? 'btn-blanco-marron' : 'btn-marron-oscuro'} rounded-xl px-4 py-3.5 text-lg`}
                  >
                    {opcion.etiqueta}
                  </button>
                );
              })}
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-black uppercase tracking-wider text-slate-300">Tu nombre (opcional)</span>
              <input
                value={nombre}
                onChange={(evento) => setNombre(evento.target.value)}
                type="text"
                maxLength={60}
                disabled={enviando}
                placeholder="Tu nombre"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-black uppercase tracking-wider text-slate-300">Mensaje</span>
              <textarea
                value={mensaje}
                onChange={(evento) => setMensaje(evento.target.value)}
                required
                rows={6}
                maxLength={3000}
                disabled={enviando}
                placeholder="Contanos qué error encontraste o qué mejorarías de la app..."
                className="w-full resize-none rounded-xl border-[1.5px] border-slate-600 bg-slate-950 p-3.5 text-lg text-white focus:border-amber-400 focus:outline-none"
              />
            </label>

            {estado.fase === 'error' && (
              <p
                role="alert"
                className="rounded-xl border border-red-500/60 bg-red-950/60 px-4 py-3 text-base font-semibold text-red-200"
              >
                {estado.texto}
              </p>
            )}
          </div>

          <div className="border-t border-amber-900/60 p-4">
            <button
              type="submit"
              disabled={!puedeEnviar}
              className="btn-blanco-marron w-full rounded-2xl py-4 text-xl disabled:opacity-50"
            >
              {enviando ? 'Enviando...' : 'Enviar mensaje'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
