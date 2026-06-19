import { Cliente } from './cliente.model';
import { Producto } from './producto.model';

export interface DetalleVenta {
  id: number;
  venta_id: number;
  producto_id: number;
  producto?: Producto;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface Venta {
  id: number;
  numero_comprobante: string;
  fecha: string | Date;
  cliente_id: number;
  cliente?: Cliente;
  subtotal: number;
  descuento: number;
  total: number;
  estado: 'COMPLETADA' | 'ANULADA' | 'PENDIENTE';
  detalles?: DetalleVenta[];
}
