import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { AuthGuard } from '../guards/auth-guard';
export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    canActivate: [AuthGuard], // 🔑 Protect TabsPage and children
    children: [
      {
        path: 'login', 
        loadComponent: () => import('../component/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'flights',
        loadComponent: () => import('../pages/flights/list/flights.page').then(m => m.FlightsPage)
      },
      {
        path: 'create',
        loadComponent: () => import('../pages/flights/create/create.page').then(m => m.CreatePage)
      },
      {
        path: 'board/:id',
        loadComponent: () => import('../pages/passenger/board/board.page').then(m => m.BoardPage)
      },
      {
        path: 'flight-detail/:id',
        loadComponent: () => import('../pages/flights/flight-detail/flight-detail.page').then(m => m.FlightDetailPage)
      },
      {
        path: '',
        redirectTo: 'flights',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'login',
    loadComponent: () => import('../component/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
