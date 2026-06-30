import { Routes } from '@angular/router';
import { RenderMode, ServerRoute } from '@angular/ssr';

export const factureRoutes: Routes = [
  {
    path: 'factures',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../../../components/pages/facture/list/factures.component').then(
            (m) => m.FacturesComponent,
          ),
        title: 'Toutes les factures',
      },
      {
        path: 'new',
        loadComponent: () =>
          import('../../../components/pages/facture/facture-create-edit.component').then(
            (m) => m.FactureCreateEditComponent,
          ),
        title: 'Créer une facture',
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
  { path: 'factures/create/:patientId', renderMode: RenderMode.Client },
  { path: 'factures/:id/edit', renderMode: RenderMode.Client },
  { path: 'factures/:id', renderMode: RenderMode.Client },
];
