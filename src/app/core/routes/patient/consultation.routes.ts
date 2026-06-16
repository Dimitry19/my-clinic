import { Routes } from '@angular/router';
import { ServerRoute } from '@angular/ssr';

export const consultationRoutes: Routes = [
  {
    path: 'consultation',
    children: [
      {
        path: '',
        redirectTo: 'create',
        pathMatch: 'full',
      },
      {
        path: 'create/:patientId',
        loadComponent: () =>
          import('../../../components/pages/patient/consultation/consultation-create.component').then(
            (m) => m.ConsultationCreateComponent,
          ),
        title: 'Créer une consultation',
      },
      {
        path: ':id',
        loadComponent: () =>
          import('../../../components/pages/patient/consultation/consultation-create.component').then(
            (m) => m.ConsultationCreateComponent,
          ),
        title: 'Details de la consultation',
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('../../../components/pages/patient/consultation/consultation-create.component').then(
            (m) => m.ConsultationCreateComponent,
          ),
        title: 'Modifier une consultation',
      },
    ],
  },
];

export const consultationServerRoutes: ServerRoute[] = [];
