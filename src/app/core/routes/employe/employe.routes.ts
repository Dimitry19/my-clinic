import { Routes } from '@angular/router';
import { ServerRoute, RenderMode } from '@angular/ssr';

export const employeRoutes: Routes = [
  {
    path: 'employes',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../../../components/pages/employe/employes.component').then(
            (m) => m.EmployesComponent,
          ),
        title: 'Tous les employés',
      },
      {
        path: 'add',
        loadComponent: () =>
          import('../../../components/pages/employe/add-edit/employe-add-edit.component').then(
            (m) => m.EmployeAddEditComponent,
          ),
        title: 'Nouvel employé',
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('../../../components/pages/employe/add-edit/employe-add-edit.component').then(
            (m) => m.EmployeAddEditComponent,
          ),
        title: 'Modifier employé',
      },
      {
        path: ':id',
        loadComponent: () =>
          import('../../../components/pages/employe/detail/employe-detail.component').then(
            (m) => m.EmployeDetailComponent,
          ),
        title: 'Dossier employé',
      },
    ],
  },
];

export const employeServerRoutes: ServerRoute[] = [
  // Routes avec paramètres dynamiques → client uniquement

  {
    // Routes avec paramètres dynamiques → client uniquement
    path: 'employes/:id/edit',
    renderMode: RenderMode.Client,
  },
  { path: 'employes/:id', renderMode: RenderMode.Client },
];
