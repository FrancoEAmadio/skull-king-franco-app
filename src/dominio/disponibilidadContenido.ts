import type {
  ConfiguracionMesa,
  ModoContenido,
  ReglasOpcionales,
  RegistroHabilidad,
} from '../tipos';

const REGLAS_AVANZADAS = new Set<keyof ReglasOpcionales>([
  'kraken',
  'ballenaBlanca',
  'botin',
]);

const REGLAS_EXPANSION = new Set<keyof ReglasOpcionales>([
  'primerOficialKong',
  'pirataMaryThorne',
  'mono15',
  'mantarrayaMoteada',
  'davyJones',
  'caminarPorLaTabla',
  'ultimaDescarga',
  'carta7',
  'carta8',
  'cartas0y14',
]);

const EVENTOS_BASE = new Set([
  'pirata_por_sk',
  'sk_por_sirena',
  'sirena_por_pirata',
  'catorce_negro',
  'catorce_color',
]);

export function modoPermiteRegla(
  modoContenido: ModoContenido,
  regla: keyof ReglasOpcionales
): boolean {
  if (REGLAS_AVANZADAS.has(regla)) return modoContenido !== 'base';
  if (REGLAS_EXPANSION.has(regla)) return modoContenido === 'expansion';
  return false;
}

export function estaReglaActiva(
  configuracion: ConfiguracionMesa,
  regla: keyof ReglasOpcionales
): boolean {
  return modoPermiteRegla(configuracion.modoContenido, regla) && configuracion.reglasOpcionales[regla];
}

export function normalizarConfiguracionPorModo(
  configuracion: ConfiguracionMesa
): ConfiguracionMesa {
  const reglasOpcionales = { ...configuracion.reglasOpcionales };
  const reglas = Object.keys(reglasOpcionales) as (keyof ReglasOpcionales)[];

  for (const regla of reglas) {
    if (!modoPermiteRegla(configuracion.modoContenido, regla)) reglasOpcionales[regla] = false;
  }

  return { ...configuracion, reglasOpcionales };
}

function hayMonstruoActivo(configuracion: ConfiguracionMesa): boolean {
  return (
    estaReglaActiva(configuracion, 'kraken') ||
    estaReglaActiva(configuracion, 'ballenaBlanca') ||
    estaReglaActiva(configuracion, 'mantarrayaMoteada')
  );
}

export function esEventoBonoBase(idEvento: string): boolean {
  return EVENTOS_BASE.has(idEvento);
}

export function estaDisponibleEventoBono(
  idEvento: string,
  configuracion: ConfiguracionMesa
): boolean {
  if (EVENTOS_BASE.has(idEvento)) return true;
  if (idEvento === 'siete_expansion') return estaReglaActiva(configuracion, 'carta7');
  if (idEvento === 'ocho_expansion') return estaReglaActiva(configuracion, 'carta8');
  if (idEvento === 'kong_por_sk_sirena') {
    return estaReglaActiva(configuracion, 'primerOficialKong');
  }
  if (idEvento === 'monstruo_davy') {
    return estaReglaActiva(configuracion, 'davyJones') && hayMonstruoActivo(configuracion);
  }
  if (idEvento === 'alianza_botin') return estaReglaActiva(configuracion, 'botin');
  return false;
}

export function estaDisponibleRegistroHabilidad(
  registro: RegistroHabilidad,
  configuracion: ConfiguracionMesa
): boolean {
  return registro.tipo !== 'Primer Oficial Kong' || estaReglaActiva(configuracion, 'primerOficialKong');
}

export function filtrarRegistrosHabilidadDisponibles(
  registros: RegistroHabilidad[],
  configuracion: ConfiguracionMesa
): RegistroHabilidad[] {
  return registros.filter((registro) =>
    estaDisponibleRegistroHabilidad(registro, configuracion)
  );
}

export function filtrarEventosBonoDisponibles(
  eventosBono: Record<string, number>,
  configuracion: ConfiguracionMesa
): Record<string, number> {
  return Object.fromEntries(
    Object.entries(eventosBono).filter(([idEvento]) =>
      estaDisponibleEventoBono(idEvento, configuracion)
    )
  );
}
