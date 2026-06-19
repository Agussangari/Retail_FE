import { Routes } from '@angular/router';
import { ProductosListComponent } from './components/productos-list/productos-list.component';
import { ProductoFormComponent } from './components/producto-form/producto-form.component';

export const routes: Routes = [
  { path: '', component: ProductosListComponent },
  { path: 'nuevo', component: ProductoFormComponent },
  { path: ':id/editar', component: ProductoFormComponent }
];
