import { Routes } from '@angular/router';
import { RenderMode, ServerRoute } from '@angular/ssr';

export const ordonnanceRoutes: Routes = [
  {
    path: 'ordonnance',
    children: [
      {
        path: '',
        redirectTo: 'create',
        pathMatch: 'full',
      },
      {
        path: 'create/:patientId',
        loadComponent: () =>
          import('../../../components/pages/ordonnance/ordonnance-create-edit.component').then(
            (m) => m.OrdonnanceCreateEditComponent,
          ),
        title: 'Créer une ordonnance',
      },

      {
        path: ':id/edit',
        loadComponent: () =>
          import('../../../components/pages/ordonnance/ordonnance-create-edit.component').then(
            (m) => m.OrdonnanceCreateEditComponent,
          ),
        title: 'Modifier une ordonnance',
      },
      {
        path: ':id',
        loadComponent: () =>
          import('../../../components/pages/ordonnance/ordonnance-create-edit.component').then(
            (m) => m.OrdonnanceCreateEditComponent,
          ),
        title: 'Details de la ordonnance',
      },
    ],
  },
];

export const ordonnanceServerRoutes: ServerRoute[] = [
  { path: 'ordonnance/create/:patientId', renderMode: RenderMode.Client },
  { path: 'ordonnance/:id/edit', renderMode: RenderMode.Client },
  { path: 'ordonnance/:id', renderMode: RenderMode.Client },
];
