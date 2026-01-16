import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: '', 
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
      // 🔑 Added Boarding Route with ID parameter
      {
        path: 'board/:id',
        loadComponent: () => import('../pages/passenger/board/board.page').then( m => m.BoardPage)
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