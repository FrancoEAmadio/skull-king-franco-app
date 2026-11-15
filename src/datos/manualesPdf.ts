export interface ManualPdf {
  titulo: string;
  descripcion?: string;
  /** Ruta dentro de /public, p. ej. "archivos/manuales/skull-king.pdf". */
  archivo: string;
}

/** Manuales oficiales en PDF. Se agregan acá cuando se sumen los archivos a public/archivos/manuales/. */
export const MANUALES_PDF: ManualPdf[] = [];
