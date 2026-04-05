import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { shopify } from './shopify.js';
import { authRouter, apiRouter, webhooksRouter } from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Built frontend lands in backend/dist/public (Vite outDir: ../backend/dist/public)
// At runtime __dirname is backend/dist, so public is one level down.
const FRONTEND_DIST = join(__dirname, 'public');

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

  // IMPORTANT: Serve static assets BEFORE ensureInstalledOnShop().
  // If static files come after, Shopify middleware intercepts .js/.css requests
  // and returns 400s instead of the actual files.
  app.use(express.static(FRONTEND_DIST));

  // Authenticated API routes.
  app.use(express.json());
  app.use('/api/*', shopify.validateAuthenticatedSession());
  app.use('/api', apiRouter);

  // Shopify session guard — only for page (non-asset, non-API) requests.
  app.use(shopify.ensureInstalledOnShop());

  // Catch-all: serve index.html for React Router paths.
  // Skip if the path has a file extension (assets) or starts with /api.
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.includes('.')) {
      return next();
    }
    res.sendFile('index.html', { root: FRONTEND_DIST });
  });

  return app;
}
