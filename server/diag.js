const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const tables = await prisma.$queryRaw`SHOW TABLES`;
        console.log('Tables:', JSON.stringify(tables, null, 2));

        const userCount = await prisma.user.count();
        console.log('User count:', userCount);

        const grievanceCount = await prisma.grievance.count();
        console.log('Grievance count:', grievanceCount);

        const firstUser = await prisma.user.findFirst();
        console.log('First user:', JSON.stringify(firstUser, null, 2));

        const firstGrievance = await prisma.grievance.findFirst();
        console.log('First grievance:', JSON.stringify(firstGrievance, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
