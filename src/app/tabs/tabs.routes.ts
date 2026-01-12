import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: '', // This matches 'tabs' from the parent
    component: TabsPage,
    children: [
      {
        path: 'flights',
        loadComponent: () => import('../pages/flights/list/flights.page').then(m => m.FlightsPage)
      },
      {
        path: 'create',
        loadComponent: () => import('../pages/flights/create/create.page').then(m => m.CreatePage)
      },
      {
        path: 'create',
        loadComponent: () => import('../pages/flights/create/create.page').then(m => m.CreatePage)
      },
      {
        path: 'check-in/:id',
        loadComponent: () => import('../pages/passenger/check-in/check-in.page').then(m => m.CheckInPage)
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
  }
];