import express, { Request, Response, NextFunction } from 'express';
import { readFileSync, existsSync } from 'fs';
import { join, basename } from 'path';
import morgan from 'morgan';
import helmet from 'helmet';
import { shopify } from './shopify.js';
import { authRouter, apiRouter, webhooksRouter } from './routes/index.js';
import storefrontRouter from './routes/api/storefront.js';
import { config } from './config.js';

// Public directory — contains the copied tradelayer-frontend HTML/CSS/JS files.
const PUBLIC_DIR = join(process.cwd(), 'public');

// CORS middleware for public storefront endpoints.
function storefrontCors(req: Request, res: Response, next: NextFunction) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.sendStatus(204); return; }
  next();
}

// Reads an HTML file from public/, injects the Shopify App Bridge script, and sends it.
// Using basename() prevents path traversal.
function serveHtml(fileName: string) {
  return (_req: Request, res: Response) => {
    const filePath = join(PUBLIC_DIR, basename(fileName));
    if (!existsSync(filePath)) { res.status(404).send('Page not found'); return; }
    let html = readFileSync(filePath, 'utf8');
    // Inject App Bridge before </head> so it's available to app.js
    html = html.replace(
      '</head>',
      `<script src="https://cdn.shopify.com/shopifycloud/app-bridge.js" data-api-key="${config.SHOPIFY_API_KEY}"></script>\n</head>`,
    );
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  };
}

export function createApp() {
  const app = express();

  // Disable helmet's default X-Frame-Options/CSP so we can set them manually.
  app.use(helmet({ frameguard: false, contentSecurityPolicy: false }));

  // Allow Shopify admin to embed this app in an iframe.
  // frame-ancestors replaces X-Frame-Options and must list the Shopify hosts.
  app.use((_req, res, next) => {
    res.removeHeader('X-Frame-Options');
    res.setHeader(
      'Content-Security-Policy',
      "frame-ancestors https://*.myshopify.com https://admin.shopify.com https://shopify.com",
    );
    next();
  });
  app.use(morgan('dev'));

  // Webhooks — raw body required for HMAC verification.
  app.use('/webhooks', express.raw({ type: 'application/json' }), webhooksRouter);

  // OAuth routes — no session guard.
  app.use(authRouter);

  app.use(express.json());

  // Public storefront endpoints (called by theme extension — no Shopify session).
  app.use('/api/storefront', storefrontCors, storefrontRouter);

  // Serve only the assets directory publicly (CSS, JS, fonts) — no auth needed.
  // HTML pages are served below, through ensureInstalledOnShop.
  app.use('/assets', express.static(join(PUBLIC_DIR, 'assets')));

  // Authenticated API routes.
  app.use('/api/*', shopify.validateAuthenticatedSession());
  app.use('/api', apiRouter);

  // Shopify session guard — redirects to /auth if not installed.
  app.use(shopify.ensureInstalledOnShop());

  // Serve HTML pages with App Bridge injection.
  // Catch each .html page and the root.
  app.get('/', serveHtml('index.html'));
  app.get('/index.html', serveHtml('index.html'));
  app.get('/:page([a-z0-9-]+).html', (req, res) => serveHtml(req.params.page + '.html')(req, res));

  return app;
}
