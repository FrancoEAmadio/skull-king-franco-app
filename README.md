# Skull King PWA - Asistente de Juego y Manual Oficial

Asistente digital en español, anotador de puntuación progresiva y enciclopedia de cartas para el juego de mesa **Skull King** (incluyendo el Juego Base, Reglas Avanzadas y la Expansión).

---

## Características Principales

- **Manual Oficial Integrado:** Ordenado estrictamente según el reglamento oficial:
  1. Reglas generales y puntuación base.
  2. Reglas del Bribón opcionales.
  3. Modo oficial para 2 jugadores (Barba Azul / Barbagrís).
  4. Comodines de bonificación (Carta Blanca).
- **Soporte Completo de Jugadores:**
  - *Juego Base / Reglas Avanzadas:* 2 a 8 jugadores.
  - *Modo Expansión:* 2 a 9 jugadores. El botón para 9 jugadores permanece en la interfaz pero se bloquea visual e interactivamente si no se activa la Expansión.
- **Motor de Puntuación Oficial:**
  - Cálculo automático de apuestas de bazas acertadas y falladas.
  - Reglas del Bribón opcionales (Metralla / Bala de Cañón).
  - Límite global estricto de **8 Cartas Blancas (Comodines de Bonificación)** por partida.
  - Alianzas independientes por carta **Botín**, premiando con +20 puntos solo cuando ambos aliados aciertan exactamente su apuesta.
  - Regla de Oro: anulación automática de bonificaciones al fallar la apuesta de bazas.
- **Catálogo Detallado de Cartas:** Descripciones, jerarquías de victoria/derrota, habilidades oficiales e imágenes asociadas en español. Incluye los piratas del Juego Base (*Rosie de Laney*, *Bandido Bendt*, *Bribón de Roatán*, *Juanita Jade*, *Harry el Gigante*, *Tigresa*) y cartas de Expansión (*Mary Thorne*, *Primer Oficial Con*, *Carta 0/14*, *Mono 15*, *Mantarraya Moteada*, *Davy Jones*, *Cañón*, *Caminar por la Tabla*, *La Última Andanada*).
- **PWA Web sin dependencias de compilación:** Desarrollada con Vue 3 y Tailwind CSS mediante archivos estáticos, lista para ejecutarse offline desde cualquier navegador o ser instalada en el dispositivo móvil.

---

## Estructura del Proyecto

Skull-King-AWP/
├── archivos/
│   ├── cartas/            # Imágenes individuales de las cartas (.png)
│   └── iconos/            # Iconos de la PWA e imagen de portada
├── js/
│   ├── datos/
│   │   ├── cartasDatos.js # Catálogo de cartas, jerarquías e imágenes
│   │   └── reglasDatos.js # Enciclopedia y manual de reglas en 4 categorías
│   ├── motor/
│   │   └── motorPuntuacion.js # Motor de puntuación, alianzas y límites globales
│   └── app.js             # Lógica e interfaz principal de Vue 3
├── estilos.css            # Hojas de estilo y directivas
├── index.html             # Interfaz principal de la PWA
├── manifest.json          # Manifiesto para instalación como app
└── readme.md              # Documentación oficial