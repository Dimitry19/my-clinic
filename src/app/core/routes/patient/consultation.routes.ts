import { Routes } from '@angular/router';
import { RenderMode, ServerRoute } from '@angular/ssr';

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
          import('../../../components/pages/patient/consultation/consultation-create-edit.component').then(
            (m) => m.ConsultationCreateEditComponent,
          ),
        title: 'Créer une consultation',
      },

      {
        path: ':id/edit',
        loadComponent: () =>
          import('../../../components/pages/patient/consultation/consultation-create-edit.component').then(
            (m) => m.ConsultationCreateEditComponent,
          ),
        title: 'Modifier une consultation',
      },
      {
        path: ':id',
        loadComponent: () =>
          import('../../../components/pages/patient/consultation/consultation-create-edit.component').then(
            (m) => m.ConsultationCreateEditComponent,
          ),
        title: 'Details de la consultation',
      },
    ],
  },
];

export const consultationServerRoutes: ServerRoute[] = [
  { path: 'consultation/create/:patientId', renderMode: RenderMode.Client },
  { path: 'consultation/:id/edit', renderMode: RenderMode.Client },
  { path: 'consultation/:id', renderMode: RenderMode.Client },
];
