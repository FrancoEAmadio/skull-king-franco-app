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
