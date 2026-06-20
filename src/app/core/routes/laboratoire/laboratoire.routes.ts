import { Routes } from '@angular/router';
import { RenderMode, ServerRoute } from '@angular/ssr';

export const examenLaboRoutes: Routes = [
  {
    path: 'examens-labo',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../../../components/pages/laboratoire/examens-labo.component').then(
            (m) => m.ExamensLaboComponent,
          ),
        title: 'Examens de laboratoire',
      },
      {
        path: 'new',
        loadComponent: () =>
          import('../../../components/pages/laboratoire/crud/examen-labo-create-edit.component').then(
            (m) => m.ExamenLaboCreateEditComponent,
          ),
        title: 'Nouvel examen de laboratoire',
      },
      {
        path: 'new/:patientId',
        loadComponent: () =>
          import('../../../components/pages/laboratoire/crud/examen-labo-create-edit.component').then(
            (m) => m.ExamenLaboCreateEditComponent,
          ),
        title: 'Nouvel examen de laboratoire',
      },
      {
        // AVANT :id — règle le conflit router Angular
        path: ':id/edit',
        loadComponent: () =>
          import('../../../components/pages/laboratoire/crud/examen-labo-create-edit.component').then(
            (m) => m.ExamenLaboCreateEditComponent,
          ),
        title: "Modifier l'examen",
      },
      {
        // Détail — maintenant branché sur ExamenLaboDetailComponent
        path: ':id',
        loadComponent: () =>
          import('../../../components/pages/laboratoire/detail/examen-labo-detail.component').then(
            (m) => m.ExamenLaboDetailComponent,
          ),
        title: "Détail de l'examen",
      },
    ],
  },
];

export const examenLaboServerRoutes: ServerRoute[] = [
  { path: 'examens-labo', renderMode: RenderMode.Client },
  { path: 'examens-labo/new', renderMode: RenderMode.Client },
  { path: 'examens-labo/new/:patientId', renderMode: RenderMode.Client },
  { path: 'examens-labo/:id/edit', renderMode: RenderMode.Client },
  { path: 'examens-labo/:id', renderMode: RenderMode.Client },
];
