import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div *ngIf="message" class="alert-container" [ngClass]="type">
      <mat-icon class="alert-icon">{{ getIcon() }}</mat-icon>
      <span class="alert-message">{{ message }}</span>
    </div>
  `,
  styles: [`
    .alert-container {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-weight: 500;
    }
    .alert-icon {
      margin-right: 12px;
    }
    .error {
      background-color: #fdecea;
      color: #d32f2f;
      border: 1px solid #f5c2c7;
    }
    .warning {
      background-color: #fff4e5;
      color: #ed6c02;
      border: 1px solid #ffe2cc;
    }
    .info {
      background-color: #e5f6fd;
      color: #0288d1;
      border: 1px solid #b3e5fc;
    }
  `]
})
export class AppAlertComponent {
  @Input() message: string = '';
  @Input() type: 'error' | 'warning' | 'info' = 'error';

  getIcon(): string {
    switch (this.type) {
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'info';
    }
  }
}
