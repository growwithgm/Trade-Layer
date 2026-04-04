import type { Session } from '@shopify/shopify-api';

// Augment Express Response.locals to include the shopify session
// that shopify-app-express attaches after validateAuthenticatedSession().
declare global {
  namespace Express {
    interface Locals {
      shopify: {
        session: Session;
      };
    }
  }
}
