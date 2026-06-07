import { Routes } from '@angular/router';
import { patientRoutes } from './core/routes/patient/patient.routes';
import { authGuard } from './core/guards/auth.guard';
import { employeRoutes } from './core/routes/employe/employe.routes';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/auth/login/login.component').then(
        (m) => m.LoginComponent,
      ),
    title: 'Connexion — Clinique Trinité',
  },
  {
    path: '',
    loadComponent: () =>
      import('./components/layout/shell.component').then(
        (m) => m.ShellComponent,
      ),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/pages/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
        title: 'Dashboard — Clinique Trinité',
      },
      ...patientRoutes,
      ...employeRoutes,
      /*{
        path: 'agenda',
        loadComponent: () =>
          import('./components/pages/agenda/agenda.component').then(
            (m) => m.AgendaComponent,
          ),
        title: 'Agenda — Clinique Trinité',
      },*/
    ],
  },

  { path: '**', redirectTo: 'dashboard' },
];
