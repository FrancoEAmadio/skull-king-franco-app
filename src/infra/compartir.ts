import type { SeriesEvolucion } from '../dominio/comparativas';
import { COLORES_SERIES } from '../ui/GraficoEvolucion';

const MEDALLAS = ['🥇', '🥈', '🥉'];

export interface FilaResultado {
  nombre: string;
  puntos: number;
}

export interface DatosResultado {
  ranking: FilaResultado[];
  fecha: string;
  rondas: number;
  series?: SeriesEvolucion;
}

export type ResultadoCompartir = 'compartido' | 'copiado' | 'descargado' | 'cancelado' | 'error';

const formatearPuntos = (valor: number) => valor.toLocaleString('es-AR');

/** Resumen en texto plano, prolijo para WhatsApp, Telegram, notas, etc. */
export function textoResultado(datos: DatosResultado): string {
  const lineas = datos.ranking.map((fila, indice) => {
    const medalla = MEDALLAS[indice] ?? `${indice + 1}.`;
    return `${medalla} ${fila.nombre} — ${formatearPuntos(fila.puntos)} pts`;
  });
  return [
    '🏴‍☠️ SKULL KING — Resultado final',
    datos.rondas > 0 ? `${datos.fecha} · ${datos.rondas} ronda${datos.rondas === 1 ? '' : 's'}` : datos.fecha,
    '',
    ...lineas,
    '',
    'Anotado con Skull King · Franco Ezequiel Amadio',
  ].join('\n');
}

export function descargarArchivo(nombre: string, contenido: Blob | string, tipo = 'application/json'): void {
  const blob = contenido instanceof Blob ? contenido : new Blob([contenido], { type: tipo });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const esCancelacion = (error: unknown) =>
  error instanceof DOMException && error.name === 'AbortError';

/** Web Share API y, si no existe, portapapeles. */
export async function compartirTexto(titulo: string, texto: string): Promise<ResultadoCompartir> {
  try {
    if (typeof navigator.share === 'function') {
      await navigator.share({ title: titulo, text: texto });
      return 'compartido';
    }
  } catch (error) {
    if (esCancelacion(error)) return 'cancelado';
  }
  try {
    await navigator.clipboard.writeText(texto);
    return 'copiado';
  } catch {
    return 'error';
  }
}

// ── Tarjeta visual (PNG) ────────────────────────────────────────────────

const ANCHO_TARJETA = 1080;

function rectRedondeado(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ancho: number,
  alto: number,
  radio: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radio, y);
  ctx.arcTo(x + ancho, y, x + ancho, y + alto, radio);
  ctx.arcTo(x + ancho, y + alto, x, y + alto, radio);
  ctx.arcTo(x, y + alto, x, y, radio);
  ctx.arcTo(x, y, x + ancho, y, radio);
  ctx.closePath();
}

function recortarTexto(ctx: CanvasRenderingContext2D, texto: string, anchoMax: number): string {
  if (ctx.measureText(texto).width <= anchoMax) return texto;
  let recortado = texto;
  while (recortado.length > 1 && ctx.measureText(`${recortado}…`).width > anchoMax) {
    recortado = recortado.slice(0, -1);
  }
  return `${recortado}…`;
}

function dibujarGrafico(
  ctx: CanvasRenderingContext2D,
  series: SeriesEvolucion,
  x0: number,
  y0: number,
  ancho: number,
  alto: number
) {
  const cantidad = Math.max(...series.series.map((s) => s.puntos.length), 0);
  if (cantidad < 2) return;
  const todos = series.series.flatMap((s) => s.puntos);
  const minimo = Math.min(0, ...todos);
  const maximo = Math.max(100, ...todos);
  const rango = maximo - minimo || 1;
  const izq = 70;
  const aba = 34;
  const anchoUtil = ancho - izq - 10;
  const altoUtil = alto - aba - 10;
  const px = (i: number) => x0 + izq + (i / (cantidad - 1)) * anchoUtil;
  const py = (v: number) => y0 + 10 + (1 - (v - minimo) / rango) * altoUtil;

  ctx.font = '22px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillStyle = '#c9b48f';
  ctx.strokeStyle = 'rgba(245, 230, 196, 0.18)';
  ctx.lineWidth = 1;
  for (const marca of [minimo, minimo + rango / 2, maximo]) {
    ctx.beginPath();
    ctx.moveTo(x0 + izq, py(marca));
    ctx.lineTo(x0 + ancho - 10, py(marca));
    ctx.stroke();
    ctx.fillText(String(Math.round(marca)), x0 + izq - 10, py(marca) + 7);
  }
  ctx.textAlign = 'center';
  const paso = cantidad > 12 ? 2 : 1;
  for (let i = 0; i < cantidad; i += 1) {
    if (i % paso === 0 || i === cantidad - 1) {
      ctx.fillText(series.etiquetas[i] ?? '', px(i), y0 + alto - 8);
    }
  }
  series.series.forEach((serie, indice) => {
    ctx.strokeStyle = serie.color ?? COLORES_SERIES[indice % COLORES_SERIES.length]!;
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    serie.puntos.forEach((valor, i) => {
      if (i === 0) ctx.moveTo(px(i), py(valor));
      else ctx.lineTo(px(i), py(valor));
    });
    ctx.stroke();
    const ultimo = serie.puntos.length - 1;
    ctx.fillStyle = ctx.strokeStyle;
    ctx.beginPath();
    ctx.arc(px(ultimo), py(serie.puntos[ultimo]!), 8, 0, Math.PI * 2);
    ctx.fill();
  });
}

/** Mosaico de símbolos piratas: el mismo del fondo de la app (calavera, sables, ancla, timón y corona). */
const SVG_PATRON = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><g transform="translate(22 20) rotate(-8 18 18) scale(1.5)" fill="white" stroke="white"><path fill-rule="evenodd" d="M12 2.5c-4.6 0-8 3.2-8 7.4 0 2.5 1.2 4.4 3 5.6V19c0 .8.6 1.5 1.5 1.5h7c.9 0 1.5-.7 1.5-1.5v-3.5c1.8-1.2 3-3.1 3-5.6 0-4.2-3.4-7.4-8-7.4zM8.6 8.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM15.4 8.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM12 12.8l-1.3 2.6h2.6z"/></g><g transform="translate(102 22) rotate(6 18 18) scale(1.5)" fill="white" stroke="white"><g fill="none" stroke-width="2" stroke-linecap="round"><path d="M4 4l12 12M14 18l4-4M16 16l4 4"/><path d="M20 4L8 16M6 14l4 4M8 16l-4 4"/></g></g><g transform="translate(20 102) rotate(5 18 18) scale(1.5)" fill="white" stroke="white"><g fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2"/><path d="M12 7v13M8 10h8M5 14c0 4 3 6 7 6s7-2 7-6M3.5 15.5L5 13.5l2 2M20.5 15.5L19 13.5l-2 2"/></g></g><g transform="translate(102 100) rotate(0 18 18) scale(1.5)" fill="white" stroke="white"><g fill="none" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="5.5"/><path d="M12 2.5v6M12 15.5v6M2.5 12h6M15.5 12h6M5.3 5.3l4.2 4.2M14.5 14.5l4.2 4.2M18.7 5.3l-4.2 4.2M9.5 14.5l-4.2 4.2"/></g></g><g transform="translate(60 64) rotate(-6 18 18) scale(1.5)" fill="white" stroke="white"><path d="M3 18h18l1.5-10-5 4L12 5 7 12l-5-4zM3 19.5h18v2H3z"/></g></svg>`;

/** Dibuja el fondo de la pantalla de inicio: degradado marrón, brillo dorado arriba y mosaico pirata que se desvanece hacia abajo. */
async function dibujarFondo(ctx: CanvasRenderingContext2D, ancho: number, alto: number) {
  const base = ctx.createLinearGradient(0, 0, 0, alto);
  base.addColorStop(0, '#5a3d1e');
  base.addColorStop(0.7, '#2f241a');
  base.addColorStop(1, '#2f241a');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, ancho, alto);

  const brillo = ctx.createRadialGradient(ancho / 2, -alto * 0.1, 0, ancho / 2, -alto * 0.1, ancho * 0.75);
  brillo.addColorStop(0, 'rgba(212, 175, 55, 0.2)');
  brillo.addColorStop(1, 'rgba(212, 175, 55, 0)');
  ctx.fillStyle = brillo;
  ctx.fillRect(0, 0, ancho, alto);

  const mosaico = await new Promise<HTMLImageElement | null>((resolver) => {
    const imagen = new Image();
    const limite = setTimeout(() => resolver(null), 4000);
    imagen.onload = () => { clearTimeout(limite); resolver(imagen); };
    imagen.onerror = () => { clearTimeout(limite); resolver(null); };
    imagen.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(SVG_PATRON)}`;
  });
  if (!mosaico) return;
  const capa = document.createElement('canvas');
  capa.width = ancho;
  capa.height = alto;
  const c2 = capa.getContext('2d');
  const patron = c2?.createPattern(mosaico, 'repeat');
  if (!c2 || !patron) return;
  c2.fillStyle = patron;
  c2.fillRect(0, 0, ancho, alto);
  const mascara = c2.createLinearGradient(0, 0, 0, alto);
  mascara.addColorStop(0, 'rgba(0,0,0,1)');
  mascara.addColorStop(0.82, 'rgba(0,0,0,1)');
  mascara.addColorStop(1, 'rgba(0,0,0,0)');
  c2.globalCompositeOperation = 'destination-in';
  c2.fillStyle = mascara;
  c2.fillRect(0, 0, ancho, alto);
  ctx.globalAlpha = 0.055;
  ctx.drawImage(capa, 0, 0);
  ctx.globalAlpha = 1;
}

/** Carga el logo de la app para dibujarlo en la tarjeta; si falla, la tarjeta usa texto. */
function cargarLogo(): Promise<HTMLImageElement | null> {
  return new Promise((resolver) => {
    const imagen = new Image();
    const limite = setTimeout(() => resolver(null), 4000);
    imagen.onload = () => { clearTimeout(limite); resolver(imagen); };
    imagen.onerror = () => { clearTimeout(limite); resolver(null); };
    imagen.src = `${import.meta.env.BASE_URL}archivos/logo-skull-king.png`;
  });
}

/** Genera una imagen PNG con el podio y (si hay datos) el gráfico de evolución. */
export async function crearTarjetaResultado(datos: DatosResultado): Promise<Blob | null> {
  const filas = datos.ranking.slice(0, 9);
  const conGrafico = !!datos.series && datos.series.series.length > 0 && datos.series.etiquetas.length > 2;
  const altoFila = 96;
  const altoGrafico = conGrafico ? 380 : 0;
  const logo = await cargarLogo();
  const anchoLogo = 380;
  const altoLogo = logo ? Math.round((anchoLogo * logo.naturalHeight) / logo.naturalWidth) : 0;
  // Cabecera: logo (o título en texto), "Resultado final" y fecha.
  const cabecera = (logo ? 50 + altoLogo : 190) + 150;
  const alto = cabecera + filas.length * altoFila + altoGrafico + (conGrafico ? 90 : 0) + 70;

  const lienzo = document.createElement('canvas');
  lienzo.width = ANCHO_TARJETA;
  lienzo.height = alto;
  const ctx = lienzo.getContext('2d');
  if (!ctx) return null;

  try {
    await document.fonts?.load('800 30px "Cinzel"');
  } catch {
    /* si las fuentes no cargan se usan las de respaldo */
  }

  await dibujarFondo(ctx, ANCHO_TARJETA, alto);

  ctx.strokeStyle = 'rgba(233, 191, 66, 0.6)';
  ctx.lineWidth = 4;
  rectRedondeado(ctx, 24, 24, ANCHO_TARJETA - 48, alto - 48, 36);
  ctx.stroke();

  ctx.textAlign = 'center';
  if (logo) {
    ctx.drawImage(logo, (ANCHO_TARJETA - anchoLogo) / 2, 50, anchoLogo, altoLogo);
  } else {
    ctx.fillStyle = '#f1d36b';
    ctx.font = '800 96px "Cinzel", Georgia, serif';
    ctx.fillText('Skull King', ANCHO_TARJETA / 2, 190);
  }
  const baseTitulo = logo ? 50 + altoLogo : 190;
  ctx.fillStyle = '#f5e6c4';
  ctx.font = '800 34px "Cinzel", Georgia, serif';
  ctx.fillText('RESULTADO FINAL', ANCHO_TARJETA / 2, baseTitulo + 56);
  ctx.fillStyle = '#d6c3a0';
  ctx.font = '28px system-ui, sans-serif';
  ctx.fillText(
    datos.rondas > 0 ? `${datos.fecha} · ${datos.rondas} ronda${datos.rondas === 1 ? '' : 's'}` : datos.fecha,
    ANCHO_TARJETA / 2,
    baseTitulo + 102
  );

  let y = cabecera;
  filas.forEach((fila, indice) => {
    const primero = indice === 0;
    ctx.fillStyle = primero ? 'rgba(233, 191, 66, 0.2)' : 'rgba(47, 36, 26, 0.7)';
    rectRedondeado(ctx, 70, y, ANCHO_TARJETA - 140, altoFila - 14, 22);
    ctx.fill();
    if (primero) {
      ctx.strokeStyle = '#e9bf42';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.textAlign = 'left';
    ctx.font = '44px system-ui, sans-serif';
    ctx.fillStyle = '#fff8e7';
    ctx.fillText(MEDALLAS[indice] ?? `${indice + 1}.`, 100, y + 56);
    ctx.font = '700 38px system-ui, sans-serif';
    ctx.fillStyle = primero ? '#f9e29a' : '#fff8e7';
    ctx.fillText(recortarTexto(ctx, fila.nombre, 520), 190, y + 56);
    ctx.textAlign = 'right';
    ctx.font = '800 42px system-ui, sans-serif';
    ctx.fillStyle = fila.puntos >= 0 ? '#f1d36b' : '#f87171';
    ctx.fillText(`${formatearPuntos(fila.puntos)} pts`, ANCHO_TARJETA - 100, y + 58);
    y += altoFila;
  });

  if (conGrafico && datos.series) {
    y += 20;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#f1d36b';
    ctx.font = '800 26px "Cinzel", Georgia, serif';
    ctx.fillText('EVOLUCIÓN POR RONDA', 80, y + 24);
    dibujarGrafico(ctx, datos.series, 70, y + 44, ANCHO_TARJETA - 140, altoGrafico - 60);
    y += altoGrafico;
    // Leyenda
    ctx.font = '600 24px system-ui, sans-serif';
    let xLeyenda = 80;
    datos.series.series.forEach((serie, indice) => {
      const nombre = recortarTexto(ctx, serie.nombre, 150);
      const anchoItem = ctx.measureText(nombre).width + 46;
      if (xLeyenda + anchoItem > ANCHO_TARJETA - 80) return;
      ctx.fillStyle = serie.color ?? COLORES_SERIES[indice % COLORES_SERIES.length]!;
      ctx.beginPath();
      ctx.arc(xLeyenda + 10, y + 12, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f5e6c4';
      ctx.textAlign = 'left';
      ctx.fillText(nombre, xLeyenda + 30, y + 20);
      xLeyenda += anchoItem + 10;
    });
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(245, 230, 196, 0.7)';
  ctx.font = '24px system-ui, sans-serif';
  ctx.fillText('Desarrollado por Franco Ezequiel Amadio', ANCHO_TARJETA / 2, alto - 50);

  return new Promise((resolver) => lienzo.toBlob((blob) => resolver(blob), 'image/png'));
}

/** Comparte la tarjeta como imagen (celulares) o la descarga si el navegador no puede compartir archivos. */
export async function compartirTarjetaResultado(datos: DatosResultado): Promise<ResultadoCompartir> {
  const blob = await crearTarjetaResultado(datos);
  if (!blob) return 'error';
  const nombreArchivo = `skull-king-resultado-${new Date().toISOString().slice(0, 10)}.png`;
  const archivo = new File([blob], nombreArchivo, { type: 'image/png' });
  try {
    if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [archivo] })) {
      await navigator.share({
        files: [archivo],
        title: 'Skull King — Resultado final',
        text: textoResultado(datos),
      });
      return 'compartido';
    }
  } catch (error) {
    if (esCancelacion(error)) return 'cancelado';
  }
  descargarArchivo(nombreArchivo, blob);
  return 'descargado';
}

/** Link público de la app: siempre se comparte este, sin importar en qué pantalla esté el usuario. */
export const LINK_BASE_APP = 'https://skull-king-franco-app.vercel.app/';

/** Copia el link de la app al portapapeles (con alternativa para navegadores viejos). */
export async function copiarLink(): Promise<boolean> {
  const link = LINK_BASE_APP;
  try {
    await navigator.clipboard.writeText(link);
    return true;
  } catch {
    try {
      const campo = document.createElement('textarea');
      campo.value = link;
      campo.setAttribute('readonly', '');
      campo.style.position = 'fixed';
      campo.style.opacity = '0';
      document.body.appendChild(campo);
      campo.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(campo);
      return ok;
    } catch {
      return false;
    }
  }
}
