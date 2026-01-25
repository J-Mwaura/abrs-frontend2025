import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs/flights',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./component/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'tabs',
    loadChildren: () =>
      import('./tabs/tabs.routes').then(m => m.routes),
    canActivate: [AuthGuard] // 🔐 protect all tabs
  },
  {
    path: '**',
    redirectTo: 'login'
  },

];
