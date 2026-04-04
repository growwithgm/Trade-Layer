import { Router } from 'express';
import { DeliveryMethod } from '@shopify/shopify-api';
import { shopify } from '../shopify.js';
import { appUninstalledHandler } from '../webhooks/appUninstalled.js';

const router = Router();

// Register all webhook topics and their handlers.
// This must be called before the server starts accepting requests.
shopify.api.webhooks.addHandlers({
  APP_UNINSTALLED: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: '/webhooks',
    callback: appUninstalledHandler,
  },
});

// Raw body is required so the HMAC can be verified against the exact bytes
// Shopify sent. The express.raw() middleware is applied in app.ts for this route.
router.post('/', shopify.processWebhooks());

export default router;
