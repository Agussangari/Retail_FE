import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface TableColumn {
  def: string;
  header: string;
  cell: (element: any) => string;
  isAction?: boolean;
}

@Component({
  selector: 'app-tabla',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatButtonModule, MatIconModule],
  template: `
    <div class="table-container mat-elevation-z8">
      <table mat-table [dataSource]="dataSource" matSort>
        
        <ng-container *ngFor="let col of columns" [matColumnDef]="col.def">
          <th mat-header-cell *matHeaderCellDef mat-sort-header [disabled]="col.isAction"> {{ col.header }} </th>
          <td mat-cell *matCellDef="let element"> 
            <ng-container *ngIf="!col.isAction">
              {{ col.cell(element) }}
            </ng-container>
            <ng-container *ngIf="col.isAction">
              <button mat-icon-button color="primary" (click)="editAction.emit(element)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteAction.emit(element)">
                <mat-icon>delete</mat-icon>
              </button>
            </ng-container>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

        <tr class="mat-row" *matNoDataRow>
          <td class="mat-cell" [attr.colspan]="displayedColumns.length" style="text-align: center; padding: 24px;">
            No se encontraron datos.
          </td>
        </tr>
      </table>

      <mat-paginator [pageSizeOptions]="[5, 10, 20]" showFirstLastButtons aria-label="Seleccionar página"></mat-paginator>
    </div>
  `,
  styles: [`
    .table-container {
      width: 100%;
      overflow-x: auto;
      border-radius: 8px;
      margin-top: 16px;
    }
    table {
      width: 100%;
    }
  `]
})
export class AppTablaComponent implements AfterViewInit {
  @Input() columns: TableColumn[] = [];
  @Input() set data(value: any[]) {
    this.dataSource.data = value || [];
  }
  
  @Output() editAction = new EventEmitter<any>();
  @Output() deleteAction = new EventEmitter<any>();

  dataSource = new MatTableDataSource<any>([]);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  get displayedColumns(): string[] {
    return this.columns.map(c => c.def);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
