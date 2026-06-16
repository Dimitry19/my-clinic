import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';

import express from 'express';
import path, { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Trust proxy (utile si reverse proxy / docker / load balancer)
 */
app.set('trust proxy', true);

/**
 * 🔧 Normalize headers BEFORE Angular SSR
 * Fixes "host not allowed" issue
 */
app.use((req, _, next) => {
  const host = req.headers.host;

  if (host) {
    const cleanHost = host.split(',')[0].trim();

    req.headers.host = cleanHost;
    req.headers['x-forwarded-host'] = cleanHost;
    req.headers['x-forwarded-proto'] =
      req.headers['x-forwarded-proto'] || 'http';
  }

  next();
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false, // Empêche Express de servir index.html pour les sous-dossiers
    redirect: false,
  }),
);

/**
 * Angular SSR handler
 */
app.use('/**', (req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => {
      if (response) {
        writeResponseToNodeResponse(response, res);
      } else {
        next();
      }
    })
    .catch(next);
});

/**
 * Start server
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;

  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Angular CLI request handler
 */
export const reqHandler = createNodeRequestHandler(app);
