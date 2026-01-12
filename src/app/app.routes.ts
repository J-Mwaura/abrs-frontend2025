import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'flights', // Automatically goes to /flights on startup
    pathMatch: 'full',
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'flights',
    loadComponent: () => import('./pages/flights/list/flights.page').then( m => m.FlightsPage)
  },
  {
    path: 'flight-detail/:',
    loadComponent: () => import('./pages/flights/flight-detail/flight-detail.page').then( m => m.FlightDetailPage)
  },
  {
    path: 'check-in/:id',
    loadComponent: () => import('./pages/passenger/check-in/check-in.page').then( m => m.CheckInPage)
  },
  {
    path: 'create',
    loadComponent: () => import('./pages/flights/create/create.page').then( m => m.CreatePage)
  },
];
