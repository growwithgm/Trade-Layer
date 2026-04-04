import { PrismaClient } from '@prisma/client';
// Singleton PrismaClient — prevents connection pool exhaustion during hot reloads.
const globalForPrisma = globalThis;
export const prisma = globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
//# sourceMappingURL=prismaClient.js.map