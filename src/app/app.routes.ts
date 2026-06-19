import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'productos', pathMatch: 'full' },
  { 
    path: 'productos', 
    loadChildren: () => import('./features/productos/productos.routes').then(m => m.routes),
    canActivate: [authGuard]
  },
  { 
    path: 'clientes', 
    loadChildren: () => import('./features/clientes/clientes.routes').then(m => m.routes),
    canActivate: [authGuard]
  },
  { 
    path: 'ventas', 
    loadChildren: () => import('./features/ventas/ventas.routes').then(m => m.routes),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'productos' } // Redirect 404s to home
];
