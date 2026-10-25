import { useState } from 'react';
import { useApp } from '../../estado/AppProvider';
import { ModalAviso } from '../../ui/ModalAviso';
import type { ConfiguracionMesa, ModoContenido, ModoRepartoId, ReglasOpcionales } from '../../tipos';
import { reglasOpcionalesPorDefectoDelModo } from '../../dominio/disponibilidadContenido';
import { MAX_RONDAS_PERSONALIZADO, MAX_CARTAS_POR_RONDA } from '../../constantes';
import { PanelReglasOpcionales } from './componentes/PanelReglasOpcionales';
import { SelectorJugadores } from './componentes/SelectorJugadores';
import { SelectorModoReparto } from './componentes/SelectorModoReparto';
import { ConfiguradorRepartoPersonalizado } from './componentes/ConfiguradorRepartoPersonalizado';

const MODOS_CONTENIDO: { id: ModoContenido; etiqueta: string }[] = [
  { id: 'base', etiqueta: '🟢 Juego Base' },
  { id: 'avanzado', etiqueta: '🟣 Reglas Avanzadas' },
  { id: 'expansion', etiqueta: '🟠 Expansión' },
];

export function PantallaNuevaPartida() {
  const { setPantallaActual, partida } = useApp();
  const { configuracionMesa, setConfiguracionMesa, comenzarPartida, idsJugadoresSeleccionados } =
    partida;
  const [mostrarAvisoJugadores, setMostrarAvisoJugadores] = useState(false);
  const [configurandoPersonalizado, setConfigurandoPersonalizado] = useState(false);
  const [modoRepartoPrevio, setModoRepartoPrevio] = useState<ModoRepartoId | null>(null);

  const intentarComenzarPartida = () => {
    if (comenzarPartida() === 'jugadores_insuficientes') setMostrarAvisoJugadores(true);
  };

  const actualizarConfig = <K extends keyof ConfiguracionMesa>(clave: K, valor: ConfiguracionMesa[K]) =>
    setConfiguracionMesa({ ...configuracionMesa, [clave]: valor });

  const cambiarModoContenido = (modo: ModoContenido) => {
    setConfiguracionMesa({
      ...configuracionMesa,
      modoContenido: modo,
      reglasOpcionales: reglasOpcionalesPorDefectoDelModo(modo),
    });
    if (modo !== 'expansion' && idsJugadoresSeleccionados.length === 9) {
      partida.alternarSeleccionJugador(idsJugadoresSeleccionados[8]!);
    }
  };

  const abrirConfiguradorPersonalizado = () => {
    if (configuracionMesa.modoReparto !== 'personalizado') {
      setModoRepartoPrevio(configuracionMesa.modoReparto);
      setConfiguracionMesa({ ...configuracionMesa, modoReparto: 'personalizado' });
    }
    setConfigurandoPersonalizado(true);
  };

  const guardarRepartoPersonalizado = (cartas: number[]) => {
    setConfiguracionMesa({ ...configuracionMesa, modoReparto: 'personalizado', cartasPorRonda: cartas });
    setConfigurandoPersonalizado(false);
    setModoRepartoPrevio(null);
  };

  const cancelarConfiguracionPersonalizada = () => {
    if (modoRepartoPrevio !== null) {
      setConfiguracionMesa({ ...configuracionMesa, modoReparto: modoRepartoPrevio });
      setModoRepartoPrevio(null);
    }
    setConfigurandoPersonalizado(false);
  };

  const cambiarModoReparto = (modo: ModoRepartoId) => {
    if (modo === 'personalizado') {
      abrirConfiguradorPersonalizado();
      return;
    }
    setConfiguracionMesa({ ...configuracionMesa, modoReparto: modo });
    setConfigurandoPersonalizado(false);
    setModoRepartoPrevio(null);
  };

  const cambiarReglaOpcional = (regla: keyof ReglasOpcionales, valor: boolean) =>
    setConfiguracionMesa({
      ...configuracionMesa,
      reglasOpcionales: { ...configuracionMesa.reglasOpcionales, [regla]: valor },
    });

  if (configurandoPersonalizado) {
    return (
      <main className="py-6 flex flex-col w-full overflow-y-auto">
        <ConfiguradorRepartoPersonalizado
          cartasPorRondaInicial={configuracionMesa.cartasPorRonda}
          maxRondas={MAX_RONDAS_PERSONALIZADO}
          maxCartasPorRonda={MAX_CARTAS_POR_RONDA}
          onGuardar={guardarRepartoPersonalizado}
          onCancelar={cancelarConfiguracionPersonalizada}
        />
      </main>
    );
  }

  return (
    <main className="py-6 flex flex-col gap-6 w-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm uppercase tracking-widest text-amber-400 font-bold block">
            Paso 1 de 5
          </span>
          <h2 className="text-3xl font-bold text-white">Configurar Mesa</h2>
        </div>
        <button
          onClick={() => setPantallaActual('inicio')}
          className="text-base text-amber-300 hover:text-white font-bold"
        >
          ✕ Cancelar
        </button>
      </div>

      <section className="tarjeta-marron p-4">
        <label className="block text-sm uppercase tracking-wider text-amber-300 font-bold mb-3">
          📦 Modo de Contenido de la Mesa
        </label>
        <div className="flex flex-col gap-2">
          {MODOS_CONTENIDO.map((modo) => {
            const seleccionado = configuracionMesa.modoContenido === modo.id;
            return (
              <button
                key={modo.id}
                onClick={() => cambiarModoContenido(modo.id)}
                className={`p-3 rounded-xl font-bold text-left text-sm border flex items-center justify-between transition-all ${
                  seleccionado ? 'btn-blanco-marron' : 'btn-marron-oscuro'
                }`}
              >
                <span>{modo.etiqueta}</span>
                <span className="text-base">{seleccionado ? '✓' : ''}</span>
              </button>
            );
          })}
        </div>
      </section>

      <SelectorModoReparto
        configuracion={configuracionMesa}
        onCambiarModo={cambiarModoReparto}
        onConfigurarPersonalizado={abrirConfiguradorPersonalizado}
      />

      <SelectorJugadores />

      <section className="grid grid-cols-2 gap-3">
        <TarjetaOpcion
          titulo="🃏 Comodines de bonificación"
          detalle="Cartas blancas: +5 a +50 pts"
          activo={configuracionMesa.usarComodinesBonificacion}
          onChange={(valor) => actualizarConfig('usarComodinesBonificacion', valor)}
        />
        <TarjetaOpcion
          titulo="🏴‍☠️ Reglas del Bribón"
          detalle="Metralla o Bala de cañón"
          activo={configuracionMesa.usarModoBribon}
          onChange={(valor) => actualizarConfig('usarModoBribon', valor)}
        />
        <TarjetaOpcion
          titulo="✨ Habilidades de piratas"
          detalle="Bribón, Harry y Kong"
          activo={configuracionMesa.usarHabilidadesPiratas}
          onChange={(valor) => actualizarConfig('usarHabilidadesPiratas', valor)}
        />
        <TarjetaOpcion
          titulo="💰 Bonos al fallar envite"
          detalle="Se cobran aunque falles"
          activo={configuracionMesa.cobrarBonosSinAcierto}
          onChange={(valor) => actualizarConfig('cobrarBonosSinAcierto', valor)}
        />
      </section>

      <PanelReglasOpcionales
        configuracion={configuracionMesa}
        onCambiar={cambiarReglaOpcional}
      />

      <button
        onClick={intentarComenzarPartida}
        className="w-full mt-2 py-4 btn-blanco-marron text-xl rounded-2xl font-black shadow-xl"
      >
        Empezar Partida ➔
      </button>

      <ModalAviso
        abierto={mostrarAvisoJugadores}
        titulo="Faltan piratas"
        mensaje="Seleccioná al menos 2 piratas para comenzar la partida."
        onCerrar={() => setMostrarAvisoJugadores(false)}
      />
    </main>
  );
}

interface TarjetaOpcionProps {
  titulo: string;
  detalle: string;
  activo: boolean;
  onChange: (valor: boolean) => void;
}

/** Tarjeta que funciona como botón: iluminada si está activa, apagada si no. Se pueden activar varias. */
function TarjetaOpcion({ titulo, detalle, activo, onChange }: TarjetaOpcionProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      onClick={() => onChange(!activo)}
      className={`flex min-h-[6.5rem] flex-col items-start justify-between gap-1 rounded-2xl p-3.5 text-left ${
        activo ? 'btn-blanco-marron' : 'btn-marron-oscuro opacity-80'
      }`}
    >
      <span className="text-base font-black leading-tight">{titulo}</span>
      <span className={`text-sm font-semibold leading-tight ${activo ? 'text-amber-900' : 'text-slate-400'}`}>
        {activo ? '✓ ' : ''}
        {detalle}
      </span>
    </button>
  );
}
