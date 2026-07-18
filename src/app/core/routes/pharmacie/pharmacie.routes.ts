import { Routes } from '@angular/router';
import { RenderMode, ServerRoute } from '@angular/ssr';

export const pharmacieRoutes: Routes = [
  {
    path: 'pharmacie',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../../../components/pages/pharmacie/pharmacie.component').then(
            (m) => m.PharmacieComponent,
          ),
        title: 'La Pharmacie',
      },
      {
        path: 'create',
        loadComponent: () =>
          import('../../../components/pages/pharmacie/pharmacie.component').then(
            (m) => m.PharmacieComponent,
          ),
        title: 'Ajouter un medicament',
      },

      {
        path: ':id/edit',
        loadComponent: () =>
          import('../../../components/pages/pharmacie/pharmacie.component').then(
            (m) => m.PharmacieComponent,
          ),
        title: 'Modifier un medicament',
      },
      {
        path: ':id',
        loadComponent: () =>
          import('../../../components/pages/pharmacie/pharmacie.component').then(
            (m) => m.PharmacieComponent,
          ),
        title: 'Details du medicament',
      },
    ],
  },
];

export const pharmacieServerRoutes: ServerRoute[] = [
  { path: 'pharmacie/create', renderMode: RenderMode.Client },
  { path: 'pharmacie/:id/edit', renderMode: RenderMode.Client },
  { path: 'pharmacie/:id', renderMode: RenderMode.Client },
];
