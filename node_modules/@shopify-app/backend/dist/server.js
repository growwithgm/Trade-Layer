import { createApp } from './app.js';
import { config } from './config.js';
import { prisma } from './db/prismaClient.js';
const app = createApp();
const server = app.listen(config.PORT, () => {
    console.log(`🚀 Backend running at http://localhost:${config.PORT}`);
    console.log(`   NODE_ENV: ${config.NODE_ENV}`);
    console.log(`   App URL:  ${config.SHOPIFY_APP_URL}`);
});
// Graceful shutdown
const shutdown = async () => {
    console.log('\nShutting down...');
    server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
    });
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
//# sourceMappingURL=server.js.map