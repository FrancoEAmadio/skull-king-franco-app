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
    `${datos.fecha} · ${datos.rondas} ronda${datos.rondas === 1 ? '' : 's'}`,
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
  ctx.fillStyle = '#94a3b8';
  ctx.strokeStyle = '#334155';
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
    ctx.strokeStyle = COLORES_SERIES[indice % COLORES_SERIES.length]!;
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

/** Genera una imagen PNG con el podio y (si hay datos) el gráfico de evolución. */
export async function crearTarjetaResultado(datos: DatosResultado): Promise<Blob | null> {
  const filas = datos.ranking.slice(0, 9);
  const conGrafico = !!datos.series && datos.series.series.length > 0 && datos.series.etiquetas.length > 2;
  const altoFila = 96;
  const altoGrafico = conGrafico ? 380 : 0;
  const alto = 360 + filas.length * altoFila + altoGrafico + (conGrafico ? 90 : 0) + 150;

  const lienzo = document.createElement('canvas');
  lienzo.width = ANCHO_TARJETA;
  lienzo.height = alto;
  const ctx = lienzo.getContext('2d');
  if (!ctx) return null;

  try {
    await document.fonts?.load('72px "Pirata One"');
    await document.fonts?.load('800 30px "Cinzel"');
  } catch {
    /* si las fuentes no cargan se usan las de respaldo */
  }

  const fondo = ctx.createLinearGradient(0, 0, 0, alto);
  fondo.addColorStop(0, '#131c2e');
  fondo.addColorStop(1, '#090d16');
  ctx.fillStyle = fondo;
  ctx.fillRect(0, 0, ANCHO_TARJETA, alto);

  ctx.strokeStyle = 'rgba(245, 158, 11, 0.55)';
  ctx.lineWidth = 4;
  rectRedondeado(ctx, 24, 24, ANCHO_TARJETA - 48, alto - 48, 36);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#fbbf24';
  ctx.font = '120px "Pirata One", Georgia, serif';
  ctx.fillText('Skull King', ANCHO_TARJETA / 2, 190);
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '800 34px "Cinzel", Georgia, serif';
  ctx.fillText('RESULTADO FINAL', ANCHO_TARJETA / 2, 250);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '28px system-ui, sans-serif';
  ctx.fillText(
    `${datos.fecha} · ${datos.rondas} ronda${datos.rondas === 1 ? '' : 's'}`,
    ANCHO_TARJETA / 2,
    296
  );

  let y = 340;
  filas.forEach((fila, indice) => {
    const primero = indice === 0;
    ctx.fillStyle = primero ? 'rgba(245, 158, 11, 0.18)' : 'rgba(30, 41, 59, 0.75)';
    rectRedondeado(ctx, 70, y, ANCHO_TARJETA - 140, altoFila - 14, 22);
    ctx.fill();
    if (primero) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.textAlign = 'left';
    ctx.font = '44px system-ui, sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(MEDALLAS[indice] ?? `${indice + 1}.`, 100, y + 56);
    ctx.font = '700 38px system-ui, sans-serif';
    ctx.fillStyle = primero ? '#fde68a' : '#f1f5f9';
    ctx.fillText(recortarTexto(ctx, fila.nombre, 520), 190, y + 56);
    ctx.textAlign = 'right';
    ctx.font = '800 42px system-ui, sans-serif';
    ctx.fillStyle = fila.puntos >= 0 ? '#fbbf24' : '#f87171';
    ctx.fillText(`${formatearPuntos(fila.puntos)} pts`, ANCHO_TARJETA - 100, y + 58);
    y += altoFila;
  });

  if (conGrafico && datos.series) {
    y += 20;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fbbf24';
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
      ctx.fillStyle = COLORES_SERIES[indice % COLORES_SERIES.length]!;
      ctx.beginPath();
      ctx.arc(xLeyenda + 10, y + 12, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e2e8f0';
      ctx.textAlign = 'left';
      ctx.fillText(nombre, xLeyenda + 30, y + 20);
      xLeyenda += anchoItem + 10;
    });
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = '#64748b';
  ctx.font = '24px system-ui, sans-serif';
  ctx.fillText('Desarrollado por Franco Ezequiel Amadio', ANCHO_TARJETA / 2, alto - 80);
  ctx.fillText('Versión Original: Agosto 2026', ANCHO_TARJETA / 2, alto - 48);

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

/** Copia el link de la app al portapapeles (con alternativa para navegadores viejos). */
export async function copiarLink(): Promise<boolean> {
  const link = `${window.location.origin}${window.location.pathname}`;
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
