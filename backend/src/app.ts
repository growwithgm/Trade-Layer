import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import { shopify } from './shopify.js';
import { authRouter, apiRouter, webhooksRouter } from './routes/index.js';
import storefrontRouter from './routes/api/storefront.js';
import { generateAppHTML } from './routes/frontend.js';
import { config } from './config.js';

export function createApp() {
  const app = express();

  app.use(
    helmet({
      frameguard: false,
      contentSecurityPolicy: false,
    }),
  );

  app.use(morgan('dev'));

  // Webhook route — raw body required for HMAC verification.
  app.use('/webhooks', express.raw({ type: 'application/json' }), webhooksRouter);

  // OAuth routes — no session guard.
  app.use(authRouter);

  app.use(express.json());

  // Public storefront endpoints (called by theme extension — no Shopify session).
  app.use('/api/storefront', storefrontRouter);

  // Authenticated API routes.
  app.use('/api/*', shopify.validateAuthenticatedSession());
  app.use('/api', apiRouter);

  // Shopify session guard — redirects to /auth if not installed.
  app.use(shopify.ensureInstalledOnShop());

  // Serve inline HTML for all remaining (page) requests.
  app.get('/*', (_req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(generateAppHTML(config.SHOPIFY_API_KEY));
  });

  return app;
}
