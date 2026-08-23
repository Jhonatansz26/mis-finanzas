export default interface Product {
  id: number;
  nombre: string;
  descripcion: string | null;
  codigo_interno: string | null;
  costo_unitario: string;
  precio_unitario: string;
  unidad_medida: string;
  negocio_id: number;
  activo: number;
  fecha_creacion: string;
  updated_at: string;
}
