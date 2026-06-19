import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { AppFormularioCampoComponent } from '../../../../shared/components/app-formulario-campo/app-formulario-campo.component';
import { Cliente } from '../../../../core/models/cliente.model';
import { ClientesService } from '../../../../core/services/clientes.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-cliente-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    AppFormularioCampoComponent
  ],
  template: `
    <h2 mat-dialog-title>{{ isEdit ? 'Editar' : 'Nuevo' }} Cliente</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <app-formulario-campo 
          label="Razón Social" 
          [control]="getControl('razon_social')">
        </app-formulario-campo>

        <app-formulario-campo 
          label="CUIT" 
          [control]="getControl('cuit')">
        </app-formulario-campo>

        <app-formulario-campo 
          label="Email" 
          type="email"
          [control]="getControl('email')">
        </app-formulario-campo>

        <div class="grid-2">
          <app-formulario-campo 
            label="Teléfono" 
            [control]="getControl('telefono')">
          </app-formulario-campo>

          <app-formulario-campo 
            label="Dirección" 
            [control]="getControl('direccion')">
          </app-formulario-campo>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid || loading" (click)="save()">
        {{ loading ? 'Guardando...' : 'Guardar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-form {
      display: flex;
      flex-direction: column;
      min-width: 400px;
      padding-top: 16px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
  `]
})
export class ClienteDialogComponent {
  form: FormGroup;
  isEdit = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private clientesService: ClientesService,
    private toastService: ToastService,
    public dialogRef: MatDialogRef<ClienteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Cliente | null
  ) {
    this.isEdit = !!data;
    this.form = this.fb.group({
      razon_social: [data?.razon_social || '', Validators.required],
      cuit: [data?.cuit || '', Validators.required],
      email: [data?.email || '', [Validators.required, Validators.email]],
      telefono: [data?.telefono || '', Validators.required],
      direccion: [data?.direccion || '', Validators.required]
    });
  }

  getControl(name: string) {
    return this.form.get(name) as any;
  }

  save() {
    if (this.form.invalid) return;
    this.loading = true;

    const value = this.form.value;
    const request = this.isEdit && this.data
      ? this.clientesService.update(this.data.id, value)
      : this.clientesService.create(value);

    request.subscribe({
      next: (result) => {
        this.toastService.success(`Cliente ${this.isEdit ? 'actualizado' : 'creado'} con éxito`);
        this.dialogRef.close(true);
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
