import { Routes } from '@angular/router';
import { RenderMode, ServerRoute } from '@angular/ssr';

export const factureRoutes: Routes = [
  {
    path: 'facture',
    children: [
      {
        path: '',
        redirectTo: 'create',
        pathMatch: 'full',
      },
      {
        path: 'create/:patientId',
        loadComponent: () =>
          import('../../../components/pages/facture/facture-create-edit.component').then(
            (m) => m.FactureCreateEditComponent,
          ),
        title: 'Créer une facture',
      },

      {
        path: ':id/edit',
        loadComponent: () =>
          import('../../../components/pages/facture/facture-create-edit.component').then(
            (m) => m.FactureCreateEditComponent,
          ),
        title: 'Modifier une facture',
      },
      {
        path: ':id',
        loadComponent: () =>
          import('../../../components/pages/facture/facture-create-edit.component').then(
            (m) => m.FactureCreateEditComponent,
          ),
        title: 'Details de la facture',
      },
    ],
  },
];

export const factureServerRoutes: ServerRoute[] = [
  { path: 'facture/create/:patientId', renderMode: RenderMode.Client },
  { path: 'facture/:id/edit', renderMode: RenderMode.Client },
  { path: 'facture/:id', renderMode: RenderMode.Client },
];
