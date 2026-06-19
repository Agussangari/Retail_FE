import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AppTablaComponent, TableColumn } from '../../../../shared/components/app-tabla/app-tabla.component';
import { Cliente } from '../../../../core/models/cliente.model';
import { ClientesService } from '../../../../core/services/clientes.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ClienteDialogComponent } from '../cliente-dialog/cliente-dialog.component';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    AppTablaComponent
  ],
  template: `
    <div class="page-header">
      <h2>Clientes</h2>
      <button mat-flat-button color="primary" (click)="openDialog()">
        <mat-icon>add</mat-icon> Nuevo Cliente
      </button>
    </div>

    <div *ngIf="loading" class="loading-state">
      Cargando clientes...
    </div>

    <app-tabla 
      *ngIf="!loading"
      [columns]="columns" 
      [data]="clientes"
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
    .loading-state {
      padding: 24px;
      text-align: center;
      color: #666;
    }
  `]
})
export class ClientesListComponent implements OnInit {
  clientes: Cliente[] = [];
  loading = false;

  columns: TableColumn[] = [
    { def: 'razon_social', header: 'Razón Social', cell: (c: Cliente) => c.razon_social },
    { def: 'cuit', header: 'CUIT', cell: (c: Cliente) => c.cuit },
    { def: 'email', header: 'Email', cell: (c: Cliente) => c.email },
    { def: 'telefono', header: 'Teléfono', cell: (c: Cliente) => c.telefono },
    { def: 'acciones', header: 'Acciones', cell: () => '', isAction: true }
  ];

  constructor(
    private clientesService: ClientesService,
    private dialog: MatDialog,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadClientes();
  }

  loadClientes() {
    this.loading = true;
    this.clientesService.getAll().subscribe({
      next: (data) => {
        this.clientes = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  openDialog(cliente?: Cliente) {
    const dialogRef = this.dialog.open(ClienteDialogComponent, {
      width: '500px',
      data: cliente || null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadClientes();
      }
    });
  }

  onEdit(cliente: Cliente) {
    this.openDialog(cliente);
  }

  onDelete(cliente: Cliente) {
    if (confirm(`¿Está seguro de eliminar al cliente ${cliente.razon_social}?`)) {
      this.clientesService.delete(cliente.id).subscribe({
        next: () => {
          this.toastService.success('Cliente eliminado');
          this.loadClientes();
        }
      });
    }
  }
}
