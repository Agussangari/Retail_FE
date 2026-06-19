import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pesoArgentino',
  standalone: true
})
export class PesoArgentinoPipe implements PipeTransform {
  transform(value: number | string): string {
    if (value == null) return '';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '';
    
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(num);
  }
}
