import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import { shopify } from './shopify.js';
import { authRouter, apiRouter, webhooksRouter } from './routes/index.js';

export function createApp() {
  const app = express();

  // Security headers. Helmet's frameguard and CSP are disabled here because
  // shopify-app-express sets the correct frame-ancestors CSP for embedded apps.
  app.use(
    helmet({
      frameguard: false,
      contentSecurityPolicy: false,
    }),
  );

  app.use(morgan('dev'));

  // Webhook route — must use raw body so HMAC verification works.
  app.use('/webhooks', express.raw({ type: 'application/json' }), webhooksRouter);

  // OAuth routes — no session guard on these.
  app.use(authRouter);

  // Authenticated API routes.
  app.use(express.json());
  app.use('/api/*', shopify.validateAuthenticatedSession());
  app.use('/api', apiRouter);

  // Serve the React SPA for all other routes.
  // ensureInstalledOnShop() checks the session JWT and redirects to /auth if needed.
  app.use(shopify.ensureInstalledOnShop());
  app.use(express.static('dist/public'));

  // Catch-all: serve index.html for client-side routing.
  app.get('*', (_req, res) => {
    res.sendFile('index.html', { root: 'dist/public' });
  });

  return app;
}
