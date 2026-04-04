import type { WebhookHandlerFunction } from '@shopify/shopify-api';
import { prisma } from '../db/prismaClient.js';

export const appUninstalledHandler: WebhookHandlerFunction = async (
  _topic,
  shop,
  _body,
) => {
  // Remove all sessions for this shop so a re-install starts fresh.
  await prisma.session.deleteMany({ where: { shop } });
  await prisma.shop.deleteMany({ where: { shopDomain: shop } });
  console.log(`App uninstalled for shop: ${shop}`);
};
