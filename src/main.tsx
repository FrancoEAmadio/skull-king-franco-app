import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { iniciarServiceWorker } from './actualizar';
import './estilos/index.css';

// Service worker: la app queda instalable y funciona sin conexión.
iniciarServiceWorker();

// Sin menú contextual (mantener apretado) ni arrastrar imágenes, salvo en los campos de texto.
document.addEventListener('contextmenu', (e) => {
  const el = e.target as HTMLElement | null;
  if (el?.closest('input, textarea')) return;
  e.preventDefault();
});
document.addEventListener('dragstart', (e) => e.preventDefault());

const contenedor = document.getElementById('root');
if (!contenedor) throw new Error('No se encontró el contenedor #root');

createRoot(contenedor).render(
  <StrictMode>
    <App />
  </StrictMode>
);
