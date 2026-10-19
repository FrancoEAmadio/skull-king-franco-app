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

## Novedades de la versión 2.1

- **Habilidades de piratas**: al borrar el registro de Harry el Gigante (o de Kong copiándolo) el envite del jugador afectado vuelve automáticamente a su valor original.
- **Gráfico de evolución** interactivo (podio, resultado final e historial).
- **Estadísticas comparativas**: rendimiento de cada jugador contra el promedio del resto (victorias, promedio, envites acertados, racha, bonos cobrados).
- **Copia de seguridad**: exportar e importar jugadores e historial en `.json`, con validación y fusión sin duplicados.
- **Compartir resultado**: texto (Web Share API / portapapeles) y tarjeta PNG descargable.
- Interfaz: textos más legibles, zoom habilitado, márgenes seguros en celulares con notch y foco visible.

> Nota: `js/` y `estilos.css` son restos de la versión anterior en JavaScript puro; `index.html` carga únicamente `src/main.tsx`.

## Créditos

Desarrollado por Franco Ezequiel Amadio — Versión Original: Agosto 2026 | Edición adaptada para Devir.
Proyecto independiente de portfolio; Skull King y su arte pertenecen a sus respectivos titulares.
