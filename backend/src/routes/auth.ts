import { Router } from 'express';
import { shopify } from '../shopify.js';

const router = Router();

// Step 1: Merchant clicks "Install" → Shopify redirects to GET /auth?shop=...
// shopify.auth.begin() validates the shop param, builds the OAuth URL with PKCE,
// stores state in a signed cookie, then 302-redirects to Shopify.
router.get('/auth', shopify.auth.begin());

// Step 2: Shopify redirects back to GET /auth/callback?code=...&state=...&hmac=...
// shopify.auth.callback() verifies HMAC + state, exchanges the code for an access
// token, persists the session via PrismaSessionStorage, then delegates to
// redirectToShopifyOrAppRoot() to send the merchant into the embedded app.
router.get(
  '/auth/callback',
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot(),
);

export default router;
