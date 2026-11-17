# Skull King — Contador de Puntos

PWA para llevar la puntuación de partidas de Skull King. Migrada a **Vite + React 19 + TypeScript + Tailwind CSS v4**.

## Requisitos

- Node.js 20+

## Comandos

```bash
npm install
npm run dev        # servidor de desarrollo
npm run build      # build de producción
npm run preview    # sirve el build
npm run typecheck  # chequeo de tipos
```

## Estructura

```
src/
  main.tsx              punto de entrada
  App.tsx               enrutado de pantallas
  constantes.ts         constantes de juego
  tipos/                tipos de dominio
  datos/                catálogos estáticos (cartas, reglas, modos de reparto)
  dominio/              lógica pura (puntuación, bonos, alianzas, habilidades)
  infra/                acceso tipado a localStorage
  features/             pantallas + hooks por feature
    inicio/
    partida/            configuración de mesa + partida en curso
    jugadores/          gestor de tarjetas permanentes + estadísticas
    wiki/               manual y catálogo de cartas
  ui/                   componentes genéricos y hooks compartidos
  estilos/              CSS global
```

## Qué hace

- **Puntaje automático por ronda**: envites, bazas ganadas, bonificaciones por capturas (piratas, sirenas, Skull King, 14 de colores y 14 negro) y validación de combinaciones imposibles.
- **Tres modos de contenido**: juego base, reglas avanzadas (Kraken, Ballena Blanca, Botín) y expansión (Primer Oficial Kong, Mary Thorne, Mono, Mantarraya, Davy Jones y más).
- **Habilidades de piratas** (Bribón de Roatán, Harry el Gigante, Primer Oficial Kong), alianzas del Botín y cartas blancas como regla propia opcional (no oficial).
- **2 a 8 jugadores**, con Barbagrís para partidas de a dos.
- **Historial y estadísticas** por jugador, comparativas contra el promedio de la mesa, gráfico de evolución y podio con empates.
- **Compartir el resultado** como texto o como imagen PNG.
- **Copia de seguridad**: exportar e importar jugadores e historial en `.json`.
- **Manual y catálogo de cartas** dentro de la app, con diagramas de jerarquías.
- **PWA instalable**, pensada para el celular, que funciona sin conexión.

## Reglas

La app sigue las reglas de la edición en español de Devir.

## Pruebas

```bash
npm test
```

> Nota: `js/` y `estilos.css` son restos de la versión anterior en JavaScript puro; `index.html` carga únicamente `src/main.tsx`.

## Créditos

Desarrollado por Franco Ezequiel Amadio — Versión original: julio 2026 | Edición adaptada para Devir.
Proyecto independiente de portfolio; Skull King y su arte pertenecen a sus respectivos titulares.
