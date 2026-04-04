import { PrismaSessionStorage } from '@shopify/shopify-app-session-storage-prisma';
import { ApiVersion, LogSeverity } from '@shopify/shopify-api';
export declare const shopify: import("@shopify/shopify-app-express").ShopifyApp<{
    api: {
        apiKey: string;
        apiSecretKey: string;
        scopes: string[];
        hostName: string;
        hostScheme: "https";
        apiVersion: ApiVersion.April24;
        isEmbeddedApp: true;
        logger: {
            level: LogSeverity.Warning | LogSeverity.Debug;
        };
    };
    auth: {
        path: string;
        callbackPath: string;
    };
    webhooks: {
        path: string;
    };
    sessionStorage: PrismaSessionStorage<import(".prisma/client").PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>>;
}>;
export type ShopifyApp = typeof shopify;
//# sourceMappingURL=shopify.d.ts.map