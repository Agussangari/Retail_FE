import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { AppFormularioCampoComponent } from '../../../../shared/components/app-formulario-campo/app-formulario-campo.component';
import { ProductosService } from '../../../../core/services/productos.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule,
    MatButtonModule, 
    MatCardModule, 
    AppFormularioCampoComponent
  ],
  template: `
    <div class="page-header">
      <h2>{{ isEdit ? 'Editar Producto' : 'Nuevo Producto' }}</h2>
    </div>

    <mat-card class="form-card">
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          
          <app-formulario-campo 
            label="Código" 
            [control]="getControl('codigo')">
          </app-formulario-campo>

          <app-formulario-campo 
            label="Descripción" 
            [control]="getControl('descripcion')">
          </app-formulario-campo>

          <div class="grid-2">
            <app-formulario-campo 
              label="Precio Costo" 
              type="number"
              [control]="getControl('precio_costo')">
            </app-formulario-campo>

            <app-formulario-campo 
              label="Precio Venta" 
              type="number"
              [control]="getControl('precio_venta')">
            </app-formulario-campo>
          </div>

          <div class="grid-2">
            <app-formulario-campo 
              label="Stock Actual" 
              type="number"
              [control]="getControl('stock_actual')">
            </app-formulario-campo>

            <app-formulario-campo 
              label="Stock Mínimo" 
              type="number"
              [control]="getControl('stock_minimo')">
            </app-formulario-campo>
          </div>

          <div class="form-actions">
            <button mat-button type="button" routerLink="/productos">Cancelar</button>
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading">
              {{ loading ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .page-header {
      margin-bottom: 24px;
    }
    .form-card {
      max-width: 600px;
      margin: 0 auto;
      padding: 24px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 24px;
    }
  `]
})
export class ProductoFormComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  productoId: number | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private productosService: ProductosService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {
    this.form = this.fb.group({
      codigo: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required]],
      precio_costo: [0, [Validators.required, Validators.min(0)]],
      precio_venta: [0, [Validators.required, Validators.min(0)]],
      stock_actual: [0, [Validators.required, Validators.min(0)]],
      stock_minimo: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEdit = true;
        this.productoId = +id;
        this.loadProducto(this.productoId);
      }
    });
  }

  getControl(name: string) {
    return this.form.get(name) as any;
  }

  loadProducto(id: number) {
    this.loading = true;
    this.productosService.getById(id).subscribe({
      next: (prod) => {
        this.form.patchValue(prod);
        this.loading = false;
      },
      error: () => {
        this.router.navigate(['/productos']);
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    const value = this.form.value;

    const request = this.isEdit && this.productoId
      ? this.productosService.update(this.productoId, value)
      : this.productosService.create(value);

    request.subscribe({
      next: () => {
        this.toastService.success(`Producto ${this.isEdit ? 'actualizado' : 'creado'} con éxito`);
        this.router.navigate(['/productos']);
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
