import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { AppTablaComponent, TableColumn } from '../../../../shared/components/app-tabla/app-tabla.component';
import { AppAlertComponent } from '../../../../shared/components/app-alert/app-alert.component';
import { ProductosService } from '../../../../core/services/productos.service';
import { Producto } from '../../../../core/models/producto.model';
import { ToastService } from '../../../../core/services/toast.service';
import { PesoArgentinoPipe } from '../../../../shared/pipes/peso-argentino.pipe';

@Component({
  selector: 'app-productos-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    AppTablaComponent,
    AppAlertComponent
  ],
  providers: [PesoArgentinoPipe],
  template: `
    <div class="page-header">
      <h2>Productos</h2>
      <button mat-flat-button color="primary" routerLink="nuevo">
        <mat-icon>add</mat-icon> Nuevo Producto
      </button>
    </div>

    <app-alert *ngIf="error" [message]="error" type="error"></app-alert>

    <div class="filters">
      <mat-form-field appearance="outline">
        <mat-label>Buscar por código o descripción...</mat-label>
        <input matInput [formControl]="searchControl">
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>
    </div>

    <div *ngIf="loading" class="loading-state">
      Cargando productos...
    </div>

    <app-tabla 
      *ngIf="!loading"
      [columns]="columns" 
      [data]="productos"
      (editAction)="onEdit($event)"
      (deleteAction)="onDelete($event)">
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
      margin-bottom: 16px;
      width: 100%;
      max-width: 400px;
    }
    .badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
    }
    .badge.low-stock {
      background-color: #fdecea;
      color: #d32f2f;
    }
    .badge.ok-stock {
      background-color: #e8f5e9;
      color: #2e7d32;
    }
    .loading-state {
      padding: 24px;
      text-align: center;
      color: #666;
    }
  `]
})
export class ProductosListComponent implements OnInit {
  productos: Producto[] = [];
  loading = false;
  error = '';
  searchControl = new FormControl('');

  columns: TableColumn[] = [
    { def: 'codigo', header: 'Código', cell: (element: Producto) => element.codigo },
    { def: 'descripcion', header: 'Descripción', cell: (element: Producto) => element.descripcion },
    { def: 'precio', header: 'Precio Venta', cell: (element: Producto) => this.pesoPipe.transform(element.precio_venta) },
    { 
      def: 'stock', 
      header: 'Stock', 
      cell: (element: Producto) => `
        <span class="badge ${element.stock_actual <= element.stock_minimo ? 'low-stock' : 'ok-stock'}">
          ${element.stock_actual}
        </span>
      ` // We'll need to adapt the table to render HTML or just text if we don't use innerHTML. 
        // For simplicity, let's just return the string and handle HTML rendering in a custom column in a real app, 
        // but here we can just return a text with an alert mark.
    },
    { def: 'acciones', header: 'Acciones', cell: () => '', isAction: true }
  ];

  constructor(
    private productosService: ProductosService,
    private router: Router,
    private toastService: ToastService,
    private pesoPipe: PesoArgentinoPipe
  ) {
    // Redefining cell to avoid HTML injection issues, using simple text
    this.columns[3].cell = (element: Producto) => {
      const isLow = element.stock_actual <= element.stock_minimo;
      return `${element.stock_actual} ${isLow ? '(Bajo)' : ''}`;
    };
  }

  ngOnInit() {
    this.loadProductos();

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(term => {
        // En un caso real llamaríamos al backend. 
        // Aquí podemos llamar a getAll({ search: term })
        this.loadProductos({ search: term });
      });
  }

  loadProductos(params?: any) {
    this.loading = true;
    this.error = '';
    this.productosService.getAll(params).subscribe({
      next: (data) => {
        this.productos = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'No se pudieron cargar los productos.';
        this.loading = false;
      }
    });
  }

  onEdit(producto: Producto) {
    this.router.navigate(['/productos', producto.id, 'editar']);
  }

  onDelete(producto: Producto) {
    if (confirm(`¿Está seguro de eliminar el producto ${producto.descripcion}?`)) {
      this.productosService.delete(producto.id).subscribe({
        next: () => {
          this.toastService.success('Producto eliminado correctamente');
          this.loadProductos();
        },
        error: () => {
          // Toast handled by interceptor
        }
      });
    }
  }
}
