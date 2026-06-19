import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-formulario-campo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  template: `
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>{{ label }}</mat-label>
      <input 
        matInput 
        [type]="type" 
        [placeholder]="placeholder" 
        [formControl]="control">
      <mat-error *ngIf="control.invalid && (control.dirty || control.touched)">
        <span *ngIf="control.errors?.['required']">Este campo es requerido.</span>
        <span *ngIf="control.errors?.['minlength']">Mínimo {{ control.errors?.['minlength'].requiredLength }} caracteres.</span>
        <span *ngIf="control.errors?.['email']">Email no válido.</span>
        <span *ngIf="control.errors?.['min']">El valor mínimo es {{ control.errors?.['min'].min }}.</span>
      </mat-error>
    </mat-form-field>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 8px;
    }
  `]
})
export class AppFormularioCampoComponent {
  @Input() label: string = '';
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() control!: FormControl;
}
