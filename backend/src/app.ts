import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { shopify } from './shopify.js';
import { authRouter, apiRouter, webhooksRouter } from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// At runtime __dirname = backend/dist.
// The build script copies frontend/dist → backend/public, so:
// backend/public is one level up from backend/dist.
const publicPath = join(__dirname, '../public');

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

  // IMPORTANT: Serve static assets BEFORE ensureInstalledOnShop() and BEFORE
  // any other middleware. This prevents Shopify auth middleware from intercepting
  // .css/.js requests and returning 400s or HTML redirects.
  app.use(
    express.static(publicPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.css')) {
          res.setHeader('Content-Type', 'text/css');
        } else if (filePath.endsWith('.js')) {
          res.setHeader('Content-Type', 'application/javascript');
        }
      },
    }),
  );

  // Authenticated API routes.
  app.use(express.json());
  app.use('/api/*', shopify.validateAuthenticatedSession());
  app.use('/api', apiRouter);

  // Shopify session guard — page requests only (assets already handled above).
  app.use(shopify.ensureInstalledOnShop());

  // Catch-all: serve index.html for React Router paths only.
  // Skip if the path has a file extension (assets) or starts with /api.
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.includes('.')) {
      return next();
    }
    res.sendFile('index.html', { root: publicPath });
  });

  return app;
}
