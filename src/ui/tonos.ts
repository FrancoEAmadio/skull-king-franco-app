/**
 * Paleta de tonos de la app. Las clases van escritas completas (Tailwind solo detecta nombres literales).
 * reposo: botón sin elegir en las tarjetas de bonos/reglas (tinte suave + borde medio).
 * activo: elegido (tinte más fuerte + borde intenso + aro).
 * punto: muestra del color, para opciones que en reposo son neutras.
 */
export type NombreTono =
  | 'amarillo' | 'violeta' | 'verde' | 'rojo' | 'azul' | 'rosa' | 'negro'
  | 'agua' | 'naranja' | 'fucsia' | 'lima' | 'indigo' | 'cian' | 'pizarra';

export interface Tono {
  reposo: string;
  activo: string;
  punto: string;
}

export const TONOS_APP: Record<NombreTono, Tono> = {
  amarillo: { reposo: 'bg-amber-50 border-amber-300 text-amber-800', activo: 'bg-amber-100 border-amber-500 text-amber-900 ring-2 ring-amber-300', punto: 'bg-amber-400' },
  violeta: { reposo: 'bg-violet-50 border-violet-300 text-violet-800', activo: 'bg-violet-100 border-violet-500 text-violet-900 ring-2 ring-violet-300', punto: 'bg-violet-500' },
  verde: { reposo: 'bg-emerald-50 border-emerald-300 text-emerald-800', activo: 'bg-emerald-100 border-emerald-500 text-emerald-900 ring-2 ring-emerald-300', punto: 'bg-emerald-500' },
  rojo: { reposo: 'bg-red-50 border-red-300 text-red-800', activo: 'bg-red-100 border-red-500 text-red-900 ring-2 ring-red-300', punto: 'bg-red-500' },
  azul: { reposo: 'bg-blue-50 border-blue-300 text-blue-800', activo: 'bg-blue-100 border-blue-500 text-blue-900 ring-2 ring-blue-300', punto: 'bg-blue-500' },
  rosa: { reposo: 'bg-pink-50 border-pink-300 text-pink-800', activo: 'bg-pink-100 border-pink-500 text-pink-900 ring-2 ring-pink-300', punto: 'bg-pink-500' },
  negro: { reposo: 'bg-slate-100 border-slate-700 text-slate-900', activo: 'bg-slate-300 border-black text-black ring-2 ring-slate-500', punto: 'bg-slate-900' },
  agua: { reposo: 'bg-teal-50 border-teal-300 text-teal-800', activo: 'bg-teal-100 border-teal-500 text-teal-900 ring-2 ring-teal-300', punto: 'bg-teal-500' },
  naranja: { reposo: 'bg-orange-50 border-orange-300 text-orange-800', activo: 'bg-orange-100 border-orange-500 text-orange-900 ring-2 ring-orange-300', punto: 'bg-orange-500' },
  fucsia: { reposo: 'bg-fuchsia-50 border-fuchsia-300 text-fuchsia-800', activo: 'bg-fuchsia-100 border-fuchsia-500 text-fuchsia-900 ring-2 ring-fuchsia-300', punto: 'bg-fuchsia-500' },
  lima: { reposo: 'bg-lime-50 border-lime-400 text-lime-800', activo: 'bg-lime-100 border-lime-600 text-lime-900 ring-2 ring-lime-300', punto: 'bg-lime-500' },
  indigo: { reposo: 'bg-indigo-50 border-indigo-300 text-indigo-800', activo: 'bg-indigo-100 border-indigo-500 text-indigo-900 ring-2 ring-indigo-300', punto: 'bg-indigo-500' },
  cian: { reposo: 'bg-cyan-50 border-cyan-300 text-cyan-800', activo: 'bg-cyan-100 border-cyan-500 text-cyan-900 ring-2 ring-cyan-300', punto: 'bg-cyan-500' },
  pizarra: { reposo: 'bg-slate-50 border-slate-300 text-slate-700', activo: 'bg-slate-200 border-slate-500 text-slate-900 ring-2 ring-slate-300', punto: 'bg-slate-500' },
};

/** Base de las opciones neutras en reposo (el color aparece al elegirlas). */
export const REPOSO_NEUTRO = 'bg-white border-slate-300 text-tinta';

/** Degradado del fondo del emoji (claro → oscuro) por tono. */
export const FONDO_AVATAR: Record<NombreTono, [string, string]> = {
  amarillo: ['#fcd34d', '#d97706'], violeta: ['#a78bfa', '#6d28d9'], verde: ['#34d399', '#047857'],
  rojo: ['#f87171', '#b91c1c'], azul: ['#60a5fa', '#1d4ed8'], rosa: ['#f472b6', '#be185d'],
  negro: ['#475569', '#0f172a'], agua: ['#2dd4bf', '#0f766e'], naranja: ['#fb923c', '#c2410c'],
  fucsia: ['#e879f9', '#a21caf'], lima: ['#a3e635', '#4d7c0f'], indigo: ['#818cf8', '#4338ca'],
  cian: ['#22d3ee', '#0e7490'], pizarra: ['#94a3b8', '#475569'],
};
