/**
 * js/data/reglasData.js
 * Instrucciones generales, matemática base y mecánicas de mesa (Incluye Modo Bribón con ejemplos oficiales).
 */

export const REGLAS_GENERALES = [
  {
    titulo: "Acertar una Apuesta Normal (1 baza o más)",
    texto: "Si adivinás exactamente cuántas bazas vas a ganar, sumás +20 puntos por cada baza ganada. Ejemplo: apostás 3 y ganás 3 = +60 puntos."
  },
  {
    titulo: "Fallar una Apuesta Normal (1 baza o más)",
    texto: "Si ganás más o menos bazas de las que dijiste, restás -10 puntos por cada baza de diferencia. Ejemplo: apostás 3 y ganás 1 (le erraste por 2) = -20 puntos."
  },
  {
    titulo: "Apuesta Cero (0 bazas) acertada",
    texto: "Si apostás a no ganar ninguna baza en toda la ronda y lo cumplís, sumás +10 puntos multiplicado por el número de la ronda actual. Ejemplo: en Ronda 7 sumás +70 puntos."
  },
  {
    titulo: "Apuesta Cero (0 bazas) fallada",
    texto: "Si apostaste 0 pero ganaste al menos 1 baza, restás -10 puntos multiplicado por el número de la ronda actual. Ejemplo: en Ronda 7 restás -70 puntos."
  },
  {
    titulo: "🏴‍☠️ Reglas del Bribón Opcionales (Envite especial)",
    texto: `¿Quieres más riesgo y más recompensas? Inmediatamente después de envidar (apostar), todos eligen simultáneamente al grito de "¡Ron! ¡Ron! ¡Ron!" cómo van a puntuar:

• Metralla (mano abierta): sigue el recuento del bribón habitual.
• Bala de cañón (puño cerrado): si tu envite es correcto, obtienes 15 puntos por cada carta repartida. No obtienes puntos si lo fallas, aunque sea por 1. Debes lograr el envite para obtener puntos de bonificación.

EJEMPLO OFICIAL DEL MANUAL:
Pongamos que se han repartido 6 cartas y has envidado 3 bazas:

✋ Si eliges la metralla (mano abierta):
• Envite correcto: te anotas 60 puntos en la ronda (6 × 10).
• Fallas, incluso por 1: te anotas 30 puntos por la ronda (6 × 5).

✊ Si eliges la bola de cañón (puño cerrado):
• Envite correcto: te anotas 90 puntos en la ronda (6 × 15).
• Fallas, incluso por 1: no te anotas puntos por la ronda (0 pts, no restás).`
  },
  {
    titulo: "⚠️ REGLA DE ORO DE BONIFICACIONES",
    texto: "Si fallás tu apuesta de bazas (sea apuesta cero o normal), NO cobrás ningún punto de bonificación por cartas especiales capturadas en esa ronda. ¡Tus bonos valen 0!"
  }
];