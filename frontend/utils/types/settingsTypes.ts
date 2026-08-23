export interface FormDataFixedCosts {
  amount: string;
  description: string;
  selectedCategory: any;
}

export interface FixedCostsData {
    activo:               number;
    categoria_egreso_id:  number;
    categoria_nombre:     string;
    descripcion:          string;
    fecha_creacion:       Date;
    id:                   number;
    monto_mensual:        string;
    negocio_id:           number;
    ultima_actualizacion: Date;
}
