import { useState } from 'react';
import { enviarFeedback, type TipoFeedback } from '../../infra/feedback';
import { EncabezadoModal, Modal } from '../../ui/Modal';

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
      <EncabezadoModal titulo="Comentarios y errores" subtitulo="Tu opinión" onCerrar={cerrar} />

      {estado.fase === 'enviado' ? (
        <>
          <div className="flex flex-col items-center gap-3 p-8 text-center" role="status">
            <span className="text-5xl" aria-hidden="true">✅</span>
            <p className="text-base font-semibold text-tinta">¡Gracias! Tu mensaje fue enviado.</p>
          </div>
          <div className="border-t border-slate-200 p-4">
            <button type="button" onClick={cerrar} className="btn-dorado w-full py-3.5 text-base">
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
                    className={`min-h-11 px-4 py-3 text-sm font-semibold ${activo ? 'opcion opcion-sel' : 'opcion'}`}
                  >
                    {opcion.etiqueta}
                  </button>
                );
              })}
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="tarjeta-titulo">Tu nombre (opcional)</span>
              <input value={nombre} onChange={(evento) => setNombre(evento.target.value)} type="text" maxLength={60} disabled={enviando} placeholder="Tu nombre" className="campo" />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="tarjeta-titulo">Mensaje</span>
              <textarea
                value={mensaje}
                onChange={(evento) => setMensaje(evento.target.value)}
                required
                rows={6}
                maxLength={3000}
                disabled={enviando}
                placeholder="Contanos qué error encontraste o qué mejorarías de la app..."
                className="campo resize-none"
              />
            </label>

            {estado.fase === 'error' && (
              <p role="alert" className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
                {estado.texto}
              </p>
            )}
          </div>

          <div className="border-t border-slate-200 p-4">
            <button type="submit" disabled={!puedeEnviar} className="btn-dorado w-full py-3.5 text-base">
              {enviando ? 'Enviando...' : 'Enviar mensaje'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
