import { useState } from 'react';
import { useApp } from '../../estado/AppProvider';
import { ModalAviso } from '../../ui/ModalAviso';
import { vibrar } from '../../infra/vibracion';
import type { ConfiguracionMesa, ModoContenido, ModoRepartoId, ReglasOpcionales } from '../../tipos';
import { reglasOpcionalesPorDefectoDelModo } from '../../dominio/disponibilidadContenido';
import { MAX_RONDAS_PERSONALIZADO, MAX_CARTAS_POR_RONDA } from '../../constantes';
import { TONOS_APP, REPOSO_NEUTRO, type NombreTono } from '../../ui/tonos';
import { PanelReglasOpcionales } from './componentes/PanelReglasOpcionales';
import { SelectorJugadores } from './componentes/SelectorJugadores';
import { SelectorModoReparto } from './componentes/SelectorModoReparto';
import { ConfiguradorRepartoPersonalizado } from './componentes/ConfiguradorRepartoPersonalizado';

const MODOS_CONTENIDO: { id: ModoContenido; etiqueta: string; tono: NombreTono }[] = [
  { id: 'base', etiqueta: 'Juego Base', tono: 'amarillo' },
  { id: 'avanzado', etiqueta: 'Reglas Avanzadas', tono: 'violeta' },
  { id: 'expansion', etiqueta: 'Expansión', tono: 'verde' },
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
      <main className="flex w-full flex-col py-4">
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

  const maxPiratasHabilidad = configuracionMesa.modoContenido === 'expansion' ? 'Bribón, Harry y Kong' : 'Bribón y Harry';

  return (
    <main className="entrar flex w-full flex-col gap-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-100">Nueva partida</span>
          <h2 className="font-display text-2xl font-bold text-white">Configurar mesa</h2>
        </div>
        <button type="button" onClick={() => setPantallaActual('inicio')} className="btn-fantasma px-3 py-2 text-sm">
          ✕ Cancelar
        </button>
      </div>

      <section className="tarjeta flex flex-col gap-3 p-4">
        <h3 className="tarjeta-titulo">1. Modo de contenido</h3>
        <div className="grid grid-cols-3 gap-2">
          {MODOS_CONTENIDO.map((modo) => {
            const seleccionado = configuracionMesa.modoContenido === modo.id;
            const tono = TONOS_APP[modo.tono];
            return (
              <button
                key={modo.id}
                type="button"
                onClick={() => cambiarModoContenido(modo.id)}
                aria-pressed={seleccionado}
                className={`flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-xl border-2 px-1.5 py-3 text-center text-sm font-semibold leading-tight ${
                  seleccionado ? tono.activo : REPOSO_NEUTRO
                }`}
              >
                <span aria-hidden="true" className={`h-2 w-2 rounded-full ${tono.punto}`} />
                {modo.etiqueta}
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

      <section className="tarjeta flex flex-col gap-3 p-4">
        <h3 className="tarjeta-titulo">4. Reglas de la mesa</h3>
        <div className="grid grid-cols-2 gap-2.5">
          <TarjetaOpcion
            titulo="🃏 Comodines de bonificación"
            tono="fucsia"
            detalle="Cartas blancas: +5 a +50 pts"
            activo={configuracionMesa.usarComodinesBonificacion}
            onChange={(valor) => actualizarConfig('usarComodinesBonificacion', valor)}
          />
          <TarjetaOpcion
            titulo="🏴‍☠️ Reglas del Bribón"
            tono="naranja"
            detalle="Metralla o Bala de cañón"
            activo={configuracionMesa.usarModoBribon}
            onChange={(valor) => actualizarConfig('usarModoBribon', valor)}
          />
          <TarjetaOpcion
            titulo="✨ Habilidades de piratas"
            tono="rojo"
            detalle={maxPiratasHabilidad}
            activo={configuracionMesa.usarHabilidadesPiratas}
            onChange={(valor) => actualizarConfig('usarHabilidadesPiratas', valor)}
          />
          <TarjetaOpcion
            titulo="💰 Bonos al fallar envite"
            tono="lima"
            detalle="Se cobran aunque falles"
            activo={configuracionMesa.cobrarBonosSinAcierto}
            onChange={(valor) => actualizarConfig('cobrarBonosSinAcierto', valor)}
          />
        </div>
      </section>

      <PanelReglasOpcionales configuracion={configuracionMesa} onCambiar={cambiarReglaOpcional} />

      <button type="button" onClick={intentarComenzarPartida} className="btn-dorado mt-1 w-full py-3.5 text-base">
        Empezar partida ➔
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
  tono: NombreTono;
  activo: boolean;
  onChange: (valor: boolean) => void;
}

/** Tarjeta-botón: apagada = neutra con una muestra del color; activa = borde y tinte de su color. */
function TarjetaOpcion({ titulo, detalle, tono, activo, onChange }: TarjetaOpcionProps) {
  const colores = TONOS_APP[tono];
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      onClick={() => {
        vibrar();
        onChange(!activo);
      }}
      className={`flex min-h-[6.5rem] flex-col items-start justify-between gap-1 rounded-xl border-2 p-3 text-left ${
        activo ? colores.activo : REPOSO_NEUTRO
      }`}
    >
      <span className="flex w-full items-start justify-between gap-2">
        <span className="text-sm font-bold leading-tight">{titulo}</span>
        <span aria-hidden="true" className={`mt-1 h-2 w-2 shrink-0 rounded-full ${colores.punto}`} />
      </span>
      <span className="text-xs font-semibold leading-tight text-slate-500">{detalle}</span>
    </button>
  );
}
