import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import { shopify } from './shopify.js';
import { authRouter, apiRouter, webhooksRouter } from './routes/index.js';
import storefrontRouter from './routes/api/storefront.js';
import { generateAppHTML } from './routes/frontend.js';
import { config } from './config.js';

// CORS middleware for public storefront endpoints.
// These are called directly from Shopify storefronts (different origin).
function storefrontCors(req: Request, res: Response, next: NextFunction) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
}

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
  // CORS headers applied so storefront JS can call from any .myshopify.com origin.
  app.use('/api/storefront', storefrontCors, storefrontRouter);

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
