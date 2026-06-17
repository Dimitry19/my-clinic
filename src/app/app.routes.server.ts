import { RenderMode, ServerRoute } from '@angular/ssr';
import { employeServerRoutes } from './core/routes/employe/employe.routes';
import { patientServerRoutes } from './core/routes/patient/patient.routes';
import { consultationServerRoutes } from './core/routes/patient/consultation.routes';

export const serverRoutes: ServerRoute[] = [
  ...patientServerRoutes,
  ...employeServerRoutes,
  ...consultationServerRoutes,
  {
    // Routes avec paramètres dynamiques → client uniquement
    path: 'dashboard',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
