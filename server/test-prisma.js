try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    console.log('Prisma Client required successfully');
} catch (e) {
    console.error('Error requiring Prisma Client:', e.message);
}
