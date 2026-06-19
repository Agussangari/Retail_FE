import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { AppTablaComponent, TableColumn } from '../../../../shared/components/app-tabla/app-tabla.component';
import { VentasService } from '../../../../core/services/ventas.service';
import { Venta } from '../../../../core/models/venta.model';
import { EstadoVentaPipe } from '../../../../shared/pipes/estado-venta.pipe';
import { PesoArgentinoPipe } from '../../../../shared/pipes/peso-argentino.pipe';

@Component({
  selector: 'app-ventas-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    AppTablaComponent,
    EstadoVentaPipe
  ],
  providers: [PesoArgentinoPipe, EstadoVentaPipe],
  template: `
    <div class="page-header">
      <h2>Ventas</h2>
      <button mat-flat-button color="primary" routerLink="nueva">
        <mat-icon>add</mat-icon> Nueva Venta
      </button>
    </div>

    <form [formGroup]="filterForm" class="filters">
      <mat-form-field appearance="outline">
        <mat-label>Estado</mat-label>
        <mat-select formControlName="estado">
          <mat-option value="">Todos</mat-option>
          <mat-option value="COMPLETADA">Completada</mat-option>
          <mat-option value="PENDIENTE">Pendiente</mat-option>
          <mat-option value="ANULADA">Anulada</mat-option>
        </mat-select>
      </mat-form-field>
    </form>

    <div *ngIf="loading" class="loading-state">
      Cargando ventas...
    </div>

    <app-tabla 
      *ngIf="!loading"
      [columns]="columns" 
      [data]="ventas">
    </app-tabla>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .filters {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }
    .badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
    }
    .badge.completada { background-color: #e8f5e9; color: #2e7d32; }
    .badge.pendiente { background-color: #fff3e0; color: #e65100; }
    .badge.anulada { background-color: #fdecea; color: #d32f2f; }
    
    .loading-state {
      padding: 24px;
      text-align: center;
      color: #666;
    }
  `]
})
export class VentasListComponent implements OnInit {
  ventas: Venta[] = [];
  loading = false;
  filterForm: FormGroup;

  columns: TableColumn[] = [
    { def: 'numero', header: 'N° Comprobante', cell: (v: Venta) => v.numero_comprobante },
    { def: 'fecha', header: 'Fecha', cell: (v: Venta) => new Date(v.fecha).toLocaleDateString() },
    { def: 'cliente', header: 'Cliente', cell: (v: Venta) => v.cliente?.razon_social || 'Consumidor Final' },
    { def: 'total', header: 'Total', cell: (v: Venta) => this.pesoPipe.transform(v.total) },
    { 
      def: 'estado', 
      header: 'Estado', 
      cell: (v: Venta) => `
        <span class="badge ${v.estado.toLowerCase()}">
          ${this.estadoPipe.transform(v.estado)}
        </span>
      `
    },
    { 
      def: 'acciones', 
      header: 'Acciones', 
      cell: (v: Venta) => `<a href="/ventas/${v.id}">Ver Detalle</a>`, 
      // Simplified link mapping. In a real Angular app, we'd use routerLink within a custom column template.
      // But for <app-tabla> we can tweak it if needed or use an action button. Let's redefine it in constructor.
    }
  ];

  constructor(
    private ventasService: VentasService,
    private fb: FormBuilder,
    private router: Router,
    private pesoPipe: PesoArgentinoPipe,
    private estadoPipe: EstadoVentaPipe
  ) {
    this.filterForm = this.fb.group({
      estado: ['']
    });

    this.columns[5].cell = (v: Venta) => `Ver Detalle`; 
    this.columns[5].isAction = true;
  }

  ngOnInit() {
    this.loadVentas();
    this.filterForm.valueChanges.subscribe(val => {
      this.loadVentas(val);
    });
  }

  loadVentas(params?: any) {
    this.loading = true;
    this.ventasService.getAll(params).subscribe({
      next: (data) => {
        this.ventas = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
