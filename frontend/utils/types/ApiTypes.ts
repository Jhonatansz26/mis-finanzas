export default interface ProductProfitData {
  estadisticas_generales: {
    ganancia_promedio_unitaria: number;
    ganancia_total_negocio: number;
    margen_promedio_porcentaje: number;
    total_productos: number;
    total_productos_vendidos: string;
  };
  periodo: {
    fecha_fin: string;
    fecha_inicio: string;
  };
  productos: Array<{
    cantidad_vendida: string;
    costo_unitario: number;
    ganancia_total: string;
    ganancia_unitaria: number;
    margen_ganancia_porcentaje: string;
    precio_unitario: number;
    producto_id: number;
    producto_nombre: string;
  }>;
  productos_mas_rentables: Array<{
    ganancia_total: string;
    nombre: string;
  }>;
  productos_menos_rentables: Array<{
    ganancia_total: string;
    nombre: string;
  }>;
}

export default interface SummaryDayData {
  total_egresos: string;
  total_ingresos: string;
  total_productos_vendidos: string;
}

export default interface LoadingStates {
  summaryDay: boolean;
  productProfit: boolean;
}
