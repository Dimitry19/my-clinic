import { Routes } from '@angular/router';
import { ServerRoute, RenderMode } from '@angular/ssr';

export const patientRoutes: Routes = [
  {
    path: 'patients',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../../../components/pages/patient/patients.component').then(
            (m) => m.PatientsComponent,
          ),
        title: 'Tous les patients',
      },

      {
        path: 'add',
        loadComponent: () =>
          import('../../../components/pages/patient/add-edit/patient-add-edit.component').then(
            (m) => m.PatientAddEditComponent,
          ),
        title: 'Nouveau patient',
      },

      {
        path: ':id/edit',
        loadComponent: () =>
          import('../../../components/pages/patient/add-edit/patient-add-edit.component').then(
            (m) => m.PatientAddEditComponent,
          ),
        title: 'Modifier patient',
      },
      {
        path: ':id',
        loadComponent: () =>
          import('../../../components/pages/patient/detail/patient-detail.component').then(
            (m) => m.PatientDetailComponent,
          ),
        title: 'Dossier patient',
      },
    ],
  },
];

export const patientServerRoutes: ServerRoute[] = [
  {
    // Routes avec paramètres dynamiques → client uniquement
    path: 'patients/:id/edit',
    renderMode: RenderMode.Client,
  },
  { path: 'patients/:id', renderMode: RenderMode.Client },
];
