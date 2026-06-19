export interface Producto {
  id: number;
  codigo: string;
  descripcion: string;
  precio_costo: number;
  precio_venta: number;
  stock_actual: number;
  stock_minimo: number;
  categoria_id: number;
  activo: boolean;
}
