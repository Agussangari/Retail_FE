import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

import { VentasService } from '../../../../core/services/ventas.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Venta } from '../../../../core/models/venta.model';
import { PesoArgentinoPipe } from '../../../../shared/pipes/peso-argentino.pipe';
import { EstadoVentaPipe } from '../../../../shared/pipes/estado-venta.pipe';

@Component({
  selector: 'app-venta-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    PesoArgentinoPipe,
    EstadoVentaPipe
  ],
  providers: [PesoArgentinoPipe, EstadoVentaPipe],
  template: `
    <div class="page-header" *ngIf="venta">
      <h2>Detalle de Venta #{{ venta.numero_comprobante }}</h2>
      <div class="actions">
        <button mat-button routerLink="/ventas">Volver</button>
        <button *ngIf="venta.estado !== 'ANULADA'" mat-flat-button color="warn" (click)="anularVenta()" [disabled]="loading">
          <mat-icon>cancel</mat-icon> Anular Venta
        </button>
      </div>
    </div>

    <div *ngIf="loading && !venta" class="loading-state">
      Cargando detalle...
    </div>

    <mat-card *ngIf="venta" class="detail-card">
      <mat-card-content>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Cliente:</span>
            <span class="value">{{ venta.cliente?.razon_social || 'Desconocido' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Fecha:</span>
            <span class="value">{{ venta.fecha | date:'dd/MM/yyyy' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Estado:</span>
            <span class="value badge" [ngClass]="venta.estado.toLowerCase()">{{ venta.estado | estadoVenta }}</span>
          </div>
        </div>

        <h3>Detalles</h3>
        <table mat-table [dataSource]="venta.detalles || []" class="mat-elevation-z2 full-width">
          <ng-container matColumnDef="producto">
            <th mat-header-cell *matHeaderCellDef> Producto </th>
            <td mat-cell *matCellDef="let element"> {{element.producto?.descripcion || 'Producto ID ' + element.producto_id}} </td>
          </ng-container>

          <ng-container matColumnDef="cantidad">
            <th mat-header-cell *matHeaderCellDef> Cantidad </th>
            <td mat-cell *matCellDef="let element"> {{element.cantidad}} </td>
          </ng-container>

          <ng-container matColumnDef="precio_unitario">
            <th mat-header-cell *matHeaderCellDef> Precio Unit. </th>
            <td mat-cell *matCellDef="let element"> {{element.precio_unitario | pesoArgentino}} </td>
          </ng-container>

          <ng-container matColumnDef="subtotal">
            <th mat-header-cell *matHeaderCellDef> Subtotal </th>
            <td mat-cell *matCellDef="let element"> {{element.subtotal | pesoArgentino}} </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <div class="totales-section">
          <div class="totales-row">
            <span>Subtotal:</span>
            <span>{{ venta.subtotal | pesoArgentino }}</span>
          </div>
          <div class="totales-row">
            <span>Descuento:</span>
            <span>{{ venta.descuento | pesoArgentino }}</span>
          </div>
          <div class="totales-row total-final">
            <span>Total:</span>
            <span>{{ venta.total | pesoArgentino }}</span>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .detail-card { padding: 16px; }
    .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    .info-item { display: flex; flex-direction: column; }
    .label { font-size: 0.9em; color: #666; }
    .value { font-size: 1.1em; font-weight: 500; }
    
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
      width: fit-content;
    }
    .badge.completada { background-color: #e8f5e9; color: #2e7d32; }
    .badge.pendiente { background-color: #fff3e0; color: #e65100; }
    .badge.anulada { background-color: #fdecea; color: #d32f2f; }

    .full-width { width: 100%; margin-bottom: 24px; }
    
    .totales-section {
      width: 100%;
      max-width: 300px;
      margin-left: auto;
      background: #f9f9f9;
      padding: 16px;
      border-radius: 8px;
    }
    .totales-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .total-final { font-size: 1.2em; font-weight: bold; margin-top: 16px; border-top: 2px solid #ccc; padding-top: 8px; }
    .loading-state { padding: 24px; text-align: center; color: #666; }
  `]
})
export class VentaDetailComponent implements OnInit {
  venta: Venta | null = null;
  loading = false;
  displayedColumns: string[] = ['producto', 'cantidad', 'precio_unitario', 'subtotal'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ventasService: VentasService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadVenta(+id);
    }
  }

  loadVenta(id: number) {
    this.loading = true;
    this.ventasService.getById(id).subscribe({
      next: (data) => {
        this.venta = data;
        this.loading = false;
      },
      error: () => {
        this.toastService.error('No se pudo cargar la venta');
        this.router.navigate(['/ventas']);
      }
    });
  }

  anularVenta() {
    if (!this.venta) return;
    if (confirm('¿Está seguro de anular esta venta? Esta acción no se puede deshacer.')) {
      this.loading = true;
      this.ventasService.anular(this.venta.id).subscribe({
        next: () => {
          this.toastService.success('Venta anulada correctamente');
          this.loadVenta(this.venta!.id); // Reload to update status
        },
        error: () => {
          this.loading = false;
        }
      });
    }
  }
}
