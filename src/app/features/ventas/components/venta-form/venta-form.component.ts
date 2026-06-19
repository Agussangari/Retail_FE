import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { Cliente } from '../../../../core/models/cliente.model';
import { Producto } from '../../../../core/models/producto.model';
import { ClientesService } from '../../../../core/services/clientes.service';
import { ProductosService } from '../../../../core/services/productos.service';
import { VentasService } from '../../../../core/services/ventas.service';
import { ToastService } from '../../../../core/services/toast.service';
import { PesoArgentinoPipe } from '../../../../shared/pipes/peso-argentino.pipe';

@Component({
  selector: 'app-venta-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatCardModule
  ],
  providers: [PesoArgentinoPipe],
  template: `
    <div class="page-header">
      <h2>Nueva Venta</h2>
    </div>

    <mat-card class="form-card">
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Cliente</mat-label>
            <mat-select formControlName="cliente_id">
              <mat-option *ngFor="let cliente of clientes" [value]="cliente.id">
                {{ cliente.razon_social }} ({{ cliente.cuit }})
              </mat-option>
            </mat-select>
          </mat-form-field>

          <div class="detalles-section">
            <h3>Detalles de la Venta</h3>
            
            <div formArrayName="detalles">
              <div *ngFor="let detalle of detalles.controls; let i=index" [formGroupName]="i" class="detalle-row">
                
                <mat-form-field appearance="outline" class="col-producto">
                  <mat-label>Producto</mat-label>
                  <mat-select formControlName="producto_id" (selectionChange)="onProductSelected(i, $event.value)">
                    <mat-option *ngFor="let producto of productos" [value]="producto.id">
                      {{ producto.descripcion }} ({{ pesoPipe.transform(producto.precio_venta) }}) - Stock: {{ producto.stock_actual }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="col-cantidad">
                  <mat-label>Cantidad</mat-label>
                  <input matInput type="number" formControlName="cantidad" (change)="calculateSubtotal(i)">
                </mat-form-field>

                <div class="col-subtotal">
                  {{ pesoPipe.transform(detalle.get('subtotal')?.value || 0) }}
                </div>

                <button mat-icon-button color="warn" type="button" (click)="removeDetalle(i)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>

            <button mat-button color="primary" type="button" (click)="addDetalle()">
              <mat-icon>add</mat-icon> Agregar Producto
            </button>
          </div>

          <div class="totales-section">
            <div class="totales-row">
              <span>Subtotal:</span>
              <span>{{ pesoPipe.transform(form.get('subtotal')?.value || 0) }}</span>
            </div>
            <div class="totales-row">
              <mat-form-field appearance="outline" class="descuento-input">
                <mat-label>Descuento</mat-label>
                <input matInput type="number" formControlName="descuento">
              </mat-form-field>
            </div>
            <div class="totales-row total-final">
              <span>Total:</span>
              <span>{{ pesoPipe.transform(form.get('total')?.value || 0) }}</span>
            </div>
          </div>

          <div class="form-actions">
            <button mat-button type="button" routerLink="/ventas">Cancelar</button>
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading || detalles.length === 0">
              {{ loading ? 'Guardando...' : 'Confirmar Venta' }}
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .page-header { margin-bottom: 24px; }
    .form-card { padding: 24px; }
    .full-width { width: 100%; margin-bottom: 16px; }
    .detalles-section { margin-top: 16px; margin-bottom: 24px; border-top: 1px solid #eee; padding-top: 16px; }
    
    .detalle-row {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 8px;
    }
    .col-producto { flex: 2; }
    .col-cantidad { flex: 1; max-width: 150px; }
    .col-subtotal { flex: 1; font-weight: bold; text-align: right; }
    
    .totales-section {
      width: 100%;
      max-width: 300px;
      margin-left: auto;
      background: #f9f9f9;
      padding: 16px;
      border-radius: 8px;
    }
    .totales-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .descuento-input { width: 100px; }
    .total-final { font-size: 1.2em; font-weight: bold; margin-top: 16px; border-top: 2px solid #ccc; padding-top: 8px; }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 24px;
    }
  `]
})
export class VentaFormComponent implements OnInit {
  form: FormGroup;
  clientes: Cliente[] = [];
  productos: Producto[] = [];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private clientesService: ClientesService,
    private productosService: ProductosService,
    private ventasService: VentasService,
    private router: Router,
    private toastService: ToastService,
    public pesoPipe: PesoArgentinoPipe
  ) {
    this.form = this.fb.group({
      cliente_id: ['', Validators.required],
      fecha: [new Date().toISOString().split('T')[0], Validators.required],
      descuento: [0, Validators.min(0)],
      subtotal: [0],
      total: [0],
      detalles: this.fb.array([])
    });

    this.form.get('descuento')?.valueChanges.subscribe(() => {
      this.calculateTotals();
    });
  }

  get detalles() {
    return this.form.get('detalles') as FormArray;
  }

  ngOnInit() {
    this.clientesService.getAll().subscribe(data => this.clientes = data);
    this.productosService.getAll().subscribe(data => this.productos = data);
    this.addDetalle();
  }

  addDetalle() {
    const detalle = this.fb.group({
      producto_id: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      precio_unitario: [0],
      subtotal: [0]
    });
    this.detalles.push(detalle);
  }

  removeDetalle(index: number) {
    this.detalles.removeAt(index);
    this.calculateTotals();
  }

  onProductSelected(index: number, productoId: number) {
    const producto = this.productos.find(p => p.id === productoId);
    if (producto) {
      const detalle = this.detalles.at(index);
      detalle.patchValue({
        precio_unitario: producto.precio_venta,
        subtotal: producto.precio_venta * detalle.get('cantidad')?.value
      });
      this.calculateTotals();
    }
  }

  calculateSubtotal(index: number) {
    const detalle = this.detalles.at(index);
    const cantidad = detalle.get('cantidad')?.value || 0;
    const precioUnitario = detalle.get('precio_unitario')?.value || 0;
    detalle.patchValue({ subtotal: cantidad * precioUnitario });
    this.calculateTotals();
  }

  calculateTotals() {
    let subtotal = 0;
    for (let i = 0; i < this.detalles.length; i++) {
      subtotal += this.detalles.at(i).get('subtotal')?.value || 0;
    }
    
    const descuento = this.form.get('descuento')?.value || 0;
    const total = Math.max(0, subtotal - descuento);

    this.form.patchValue({ subtotal, total }, { emitEvent: false });
  }

  onSubmit() {
    if (this.form.invalid || this.detalles.length === 0) return;
    
    this.loading = true;
    this.ventasService.create(this.form.value).subscribe({
      next: () => {
        this.toastService.success('Venta registrada con éxito');
        this.router.navigate(['/ventas']);
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
