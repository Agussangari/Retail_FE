import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'estadoVenta',
  standalone: true
})
export class EstadoVentaPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    switch (value.toUpperCase()) {
      case 'COMPLETADA':
        return 'Completada';
      case 'ANULADA':
        return 'Anulada';
      case 'PENDIENTE':
        return 'Pendiente';
      default:
        return value;
    }
  }
}
