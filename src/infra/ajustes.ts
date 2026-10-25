export interface Ajustes {
  mantenerPantallaEncendida: boolean;
  vibracion: boolean;
}

const CLAVE = 'skullking_ajustes';

export const AJUSTES_POR_DEFECTO: Ajustes = {
  mantenerPantallaEncendida: true,
  vibracion: true,
};

export function cargarAjustes(): Ajustes {
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (!crudo) return AJUSTES_POR_DEFECTO;
    const dato = JSON.parse(crudo) as Partial<Ajustes>;
    return {
      mantenerPantallaEncendida:
        typeof dato.mantenerPantallaEncendida === 'boolean'
          ? dato.mantenerPantallaEncendida
          : AJUSTES_POR_DEFECTO.mantenerPantallaEncendida,
      vibracion: typeof dato.vibracion === 'boolean' ? dato.vibracion : AJUSTES_POR_DEFECTO.vibracion,
    };
  } catch {
    return AJUSTES_POR_DEFECTO;
  }
}

export function guardarAjustes(ajustes: Ajustes): void {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(ajustes));
  } catch {
    /* sin espacio o modo privado: se ignora */
  }
}
