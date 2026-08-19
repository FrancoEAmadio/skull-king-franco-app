import { useApp } from '../../estado/AppProvider';
import { Toggle } from '../../ui/Toggle';
import type { ConfiguracionMesa, ModoContenido, ModoRepartoId, ReglasOpcionales } from '../../tipos';
import { PanelReglasOpcionales } from './componentes/PanelReglasOpcionales';
import { SelectorJugadores } from './componentes/SelectorJugadores';
import { SelectorModoReparto } from './componentes/SelectorModoReparto';

const MODOS_CONTENIDO: { id: ModoContenido; etiqueta: string }[] = [
  { id: 'base', etiqueta: '🟢 Juego Base' },
  { id: 'avanzado', etiqueta: '🟣 Reglas Avanzadas' },
  { id: 'expansion', etiqueta: '🟠 Expansión' },
];

export function PantallaNuevaPartida() {
  const { setPantallaActual, partida } = useApp();
  const { configuracionMesa, setConfiguracionMesa, comenzarPartida, idsJugadoresSeleccionados } =
    partida;

  const actualizarConfig = <K extends keyof ConfiguracionMesa>(clave: K, valor: ConfiguracionMesa[K]) =>
    setConfiguracionMesa({ ...configuracionMesa, [clave]: valor });

  const cambiarModoContenido = (modo: ModoContenido) => {
    setConfiguracionMesa({ ...configuracionMesa, modoContenido: modo });
    if (modo !== 'expansion' && idsJugadoresSeleccionados.length === 9) {
      partida.alternarSeleccionJugador(idsJugadoresSeleccionados[8]!);
    }
  };

  const cambiarModoReparto = (modo: ModoRepartoId) =>
    setConfiguracionMesa({ ...configuracionMesa, modoReparto: modo });

  const cambiarCartasPersonalizadas = (indice: number, cantidad: number) => {
    const nuevas = [...configuracionMesa.cartasPorRonda];
    nuevas[indice] = cantidad;
    setConfiguracionMesa({ ...configuracionMesa, cartasPorRonda: nuevas });
  };

  const cambiarReglaOpcional = (regla: keyof ReglasOpcionales, valor: boolean) =>
    setConfiguracionMesa({
      ...configuracionMesa,
      reglasOpcionales: { ...configuracionMesa.reglasOpcionales, [regla]: valor },
    });

  return (
    <main className="py-6 flex flex-col gap-6 w-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold block">
            Paso 1 de 5
          </span>
          <h2 className="text-2xl font-bold text-white">Configurar Mesa</h2>
        </div>
        <button
          onClick={() => setPantallaActual('inicio')}
          className="text-sm text-amber-300 hover:text-white font-bold"
        >
          ✕ Cancelar
        </button>
      </div>

      <section className="tarjeta-marron p-4">
        <label className="block text-xs uppercase tracking-wider text-amber-300 font-bold mb-3">
          📦 Modo de Contenido de la Mesa
        </label>
        <div className="flex flex-col gap-2">
          {MODOS_CONTENIDO.map((modo) => {
            const seleccionado = configuracionMesa.modoContenido === modo.id;
            return (
              <button
                key={modo.id}
                onClick={() => cambiarModoContenido(modo.id)}
                className={`p-3 rounded-xl font-bold text-left text-xs border flex items-center justify-between transition-all ${
                  seleccionado ? 'btn-blanco-marron' : 'btn-marron-oscuro'
                }`}
              >
                <span>{modo.etiqueta}</span>
                <span className="text-sm">{seleccionado ? '✓' : ''}</span>
              </button>
            );
          })}
        </div>
      </section>

      <SelectorModoReparto
        configuracion={configuracionMesa}
        onCambiarModo={cambiarModoReparto}
        onCambiarCartasPersonalizadas={cambiarCartasPersonalizadas}
      />

      <SelectorJugadores />

      <section className="flex flex-col gap-3">
        <TarjetaToggle
          titulo="¿Comodines de Bonificación?"
          activo={configuracionMesa.usarComodinesBonificacion}
          onChange={(valor) => actualizarConfig('usarComodinesBonificacion', valor)}
          ayuda="🃏 Al recibir una Carta Blanca, apartala y robá otra del mazo. Bonificación final: 1 = +5 pts | 2 = +10 pts | 3 = +20 pts | 4+ = +50 pts."
        />
        <TarjetaToggle
          titulo="¿Reglas del Bribón Opcionales?"
          activo={configuracionMesa.usarModoBribon}
          onChange={(valor) => actualizarConfig('usarModoBribon', valor)}
          ayuda="🏴‍☠️ Permite elegir entre Metralla (Mano abierta) para asegurar puntos o Bala de cañón (Puño cerrado) para arriesgar por una recompensa mayor."
        />
        <TarjetaToggle
          titulo="¿Habilidades de Piratas?"
          activo={configuracionMesa.usarHabilidadesPiratas}
          onChange={(valor) => actualizarConfig('usarHabilidadesPiratas', valor)}
          ayuda="🏴‍☠️ Activa habilidades que modifican puntuación y envites: Bribón de Roatán (±0/10/20 pts), Harry el Gigante (±1 baza) y Primer Oficial Kong."
        />
        <TarjetaToggle
          titulo="¿Cobrar bonos al fallar envite?"
          activo={configuracionMesa.cobrarBonosSinAcierto}
          onChange={(valor) => actualizarConfig('cobrarBonosSinAcierto', valor)}
          ayuda="ℹ️ Por defecto (regla oficial), las bonificaciones normales de captura solo se suman si acertás tu envite."
          ayudaSiempreVisible
        />
      </section>

      <PanelReglasOpcionales
        configuracion={configuracionMesa}
        onCambiar={cambiarReglaOpcional}
      />

      <button
        onClick={comenzarPartida}
        className="w-full mt-2 py-4 btn-blanco-marron text-lg rounded-2xl font-black shadow-xl"
      >
        Empezar Partida ➔
      </button>
    </main>
  );
}

interface TarjetaToggleProps {
  titulo: string;
  activo: boolean;
  onChange: (valor: boolean) => void;
  ayuda: string;
  ayudaSiempreVisible?: boolean;
}

function TarjetaToggle({ titulo, activo, onChange, ayuda, ayudaSiempreVisible }: TarjetaToggleProps) {
  const mostrarAyuda = ayudaSiempreVisible || activo;
  return (
    <div className="p-4 tarjeta-marron">
      <label className="flex items-center justify-between cursor-pointer">
        <span className="font-bold text-sm text-white">{titulo}</span>
        <Toggle checked={activo} onChange={onChange} />
      </label>
      {mostrarAyuda && (
        <p className="text-xs text-slate-300 leading-relaxed mt-2 border-t border-amber-900/50 pt-2">
          {ayuda}
        </p>
      )}
    </div>
  );
}
