# 🏴‍☠️ Skull King Franco - Contador de Puntos y Manual Interactivo

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vue.js](https://img.shields.io/badge/Vue.js_3-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

**Skull King Franco** es una aplicación web de página única (SPA) diseñada especialmente para dispositivos móviles, pensada para llevar el control absoluto de puntuaciones, apuestas y bonificaciones en partidas del juego de mesa **Skull King**. 

Además del contador automático, incluye un **Manual de Jerarquía Interactivo** con el catálogo completo de cartas, cantidades físicas de la caja y variantes oficiales del reglamento.

---

## ✨ Características Principales

- 📱 **Interfaz Mobile-First & Táctil:** Diseño optimizado para teléfonos móviles con botones amplios, palos de cartas en columna vertical y navegación fluida entre rondas.
- 🎲 **Mesa Configurable (2 a 9 Jugadores):** Banco de nombres por defecto (*Franco, Simón, Nese, Punga, Eguren, Negreano, Martina, Ledesma, Andrada*) con sistema de **flechas de reordenamiento en tiempo real** (▲ / ▼) para sentar a los jugadores según el orden de la mesa.
- 🛡️ **Topes Matemáticos y Bloqueo de Trampas:** Validación inteligente en tiempo real que impide registrar más cartas de las que físicamente existen en el mazo (ej. *sólo 1 Skull King, 1 14 Negro, máximo 2 Sirenas, etc.*) y bloquea cartas únicas si ya fueron reclamadas por otro jugador en la misma ronda.
- 🏴‍☠️ **Soporte para Modo Bribón Opcional:** Cálculo automático para las apuestas de **Metralla (Mano abierta)** *(10 pts / 5 pts)* y **Bala de Cañón (Puño cerrado)** *(15 pts / 0 pts)* según la página 20 del manual oficial.
- 🃏 **Reglas de Casa ("Regla Franco"):** Sistema opcional de acumulación de *Comodines Blancos estilo Canasta* (+10, +20, +50 o +100 pts al final de la partida).
- 📜 **Historial de Partidas y LocalStorage:** Guardado automático preventivo ante cierres accidentales del navegador y registro histórico de podios finales.
- 📖 **Manual y Jerarquía Integrado:** Catálogo visual con imágenes de cartas, explicación de habilidades de los 7 piratas, monstruos marinos y reglas de puntuación.

---

## 🛠️ Tecnologías Utilizadas

- **HTML5 & CSS3** (Estructura semántica y diseño personalizado con temas *Deep Sea / Midnight Pirate*).
- **Tailwind CSS** (Estilos utilitarios modernos y diseño responsivo).
- **Vue.js 3** (Reactividad, control de estado de la mesa y renderizado condicional sin dependencias complejas).
- **JavaScript ES6+** (Motor matemático de puntuación aislado en módulos importables).

---

## 📂 Estructura del Proyecto

```text
skull-king-franco/
│
├── index.html               # Estructura principal y plantillas de pantallas
├── estilos.css              # Variables CSS, efectos Glassmorphism y botones piratas
├── README.md                # Documentación del proyecto
│
├── js/
│   ├── app.js               # Controlador de Vue 3, turnos y estado de la mesa
│   ├── engine/
│   │   └── scoreEngine.js   # Motor matemático puro (Cálculo de bazas, bonos y Bribón)
│   └── data/
│       ├── cartasData.js    # Catálogo de cartas, rutas de imágenes y topes físicos
│       └── reglasData.js    # Textos del manual y ejemplos oficiales de envite
│
└── archivos/
    ├── iconos/
    │   ├── tapa.png         # Portada principal del juego
    │   └── lady.png         # Favicon de la aplicación
    └── cartas/              # Imágenes individuales de las cartas (.png)
