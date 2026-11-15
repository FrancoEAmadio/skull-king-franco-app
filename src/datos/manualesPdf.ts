export interface ManualPdf {
  titulo: string;
  descripcion: string;
  /** Ruta dentro de /public (p. ej. "archivos/manuales/manual-oficial.pdf"). null = todavía no está cargado. */
  archivo: string | null;
}

/** Cuando se sume cada PDF a public/archivos/manuales/, se completa su `archivo` y el botón se habilita solo. */
export const MANUALES_PDF: ManualPdf[] = [
  { titulo: 'Manual oficial', descripcion: 'Juego base y reglas avanzadas', archivo: null },
  { titulo: 'Manual de la expansión', descripcion: 'Cartas y reglas de la expansión', archivo: null },
];
