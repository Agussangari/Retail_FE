import { Routes } from '@angular/router';
import { VentasListComponent } from './components/ventas-list/ventas-list.component';
import { VentaFormComponent } from './components/venta-form/venta-form.component';
import { VentaDetailComponent } from './components/venta-detail/venta-detail.component';

export const routes: Routes = [
  { path: '', component: VentasListComponent },
  { path: 'nueva', component: VentaFormComponent },
  { path: ':id', component: VentaDetailComponent }
];
