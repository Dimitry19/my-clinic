import { Routes } from '@angular/router';
import { patientRoutes } from './core/routes/patient/patient.routes';
import { authGuard } from './core/guards/auth.guard';
import { employeRoutes } from './core/routes/employe/employe.routes';
import { consultationRoutes } from './core/routes/patient/consultation.routes';
import { examenLaboRoutes } from './core/routes/laboratoire/laboratoire.routes';
import { ordonnanceRoutes } from './core/routes/ordonnance/ordonnance.routes';
import { factureRoutes } from './core/routes/facture/facture.routes';

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
    title: 'Connexion — Centre  Médical la Trinité',
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
        title: 'Dashboard — Centre  Médical la Trinité',
        data: { roles: ['MEDECIN', 'SUPER_ADMIN', 'ADMIN'] },
      },
      ...patientRoutes,
      ...employeRoutes,
      ...consultationRoutes,
      ...examenLaboRoutes,
      ...ordonnanceRoutes,
      ...factureRoutes,
      {
        path: 'agenda',
        loadComponent: () =>
          import('./components/pages/agenda/agenda.component').then(
            (m) => m.AgendaComponent,
          ),
        title: 'Agenda — Centre  Médical la Trinité',
      },
    ],
  },
  {
    path: 'not-found',
    loadComponent: () =>
      import('./components/pages/not-found/not-found.component').then(
        (m) => m.NotFoundComponent,
      ),
  },

  { path: '**', redirectTo: 'agenda' },
];
