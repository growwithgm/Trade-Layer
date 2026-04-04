import { shopifyApp } from '@shopify/shopify-app-express';
import { PrismaSessionStorage } from '@shopify/shopify-app-session-storage-prisma';
import { ApiVersion, LogSeverity } from '@shopify/shopify-api';
import { prisma } from './db/prismaClient.js';
import { config } from './config.js';

export const shopify = shopifyApp({
  api: {
    apiKey: config.SHOPIFY_API_KEY,
    apiSecretKey: config.SHOPIFY_API_SECRET,
    scopes: config.SHOPIFY_API_SCOPES.split(','),
    // hostName must be the raw hostname without protocol (e.g. "abc.ngrok.io")
    hostName: config.HOST.replace(/^https?:\/\//, ''),
    hostScheme: 'https',
    apiVersion: ApiVersion.April24,
    isEmbeddedApp: true,
    logger: {
      level: config.NODE_ENV === 'development' ? LogSeverity.Debug : LogSeverity.Warning,
    },
  },
  auth: {
    path: '/auth',
    callbackPath: '/auth/callback',
  },
  webhooks: {
    path: '/webhooks',
  },
  sessionStorage: new PrismaSessionStorage(prisma),
});

export type ShopifyApp = typeof shopify;
