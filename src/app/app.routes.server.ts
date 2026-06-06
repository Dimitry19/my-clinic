import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Routes avec paramètres dynamiques → client uniquement
  { path: 'patients/:id', renderMode: RenderMode.Client },
  {
    // Routes avec paramètres dynamiques → client uniquement
    path: 'patients/:id/edit',
    renderMode: RenderMode.Client,
  },
  {
    // Routes avec paramètres dynamiques → client uniquement
    path: 'patients/all',
    renderMode: RenderMode.Client,
  },
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
