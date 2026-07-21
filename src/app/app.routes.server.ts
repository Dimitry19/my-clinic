import { RenderMode, ServerRoute } from '@angular/ssr';
import { employeServerRoutes } from './core/routes/employe/employe.routes';
import { patientServerRoutes } from './core/routes/patient/patient.routes';
import { consultationServerRoutes } from './core/routes/patient/consultation.routes';
import { examenLaboServerRoutes } from './core/routes/laboratoire/laboratoire.routes';
import { ordonnanceServerRoutes } from './core/routes/ordonnance/ordonnance.routes';
import { factureServerRoutes } from './core/routes/facture/facture.routes';
import { pharmacieServerRoutes } from './core/routes/pharmacie/pharmacie.routes';

export const serverRoutes: ServerRoute[] = [
  ...patientServerRoutes,
  ...employeServerRoutes,
  ...consultationServerRoutes,
  ...examenLaboServerRoutes,
  ...ordonnanceServerRoutes,
  ...factureServerRoutes,
  ...pharmacieServerRoutes,
  {
    // Routes avec paramètres dynamiques → client uniquement
    path: 'dashboard',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
