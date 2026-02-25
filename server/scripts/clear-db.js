const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Cleaning Up Database ---');
    try {
        console.log('Deleting Action Logs...');
        // Delete logs first because they likely reference grievances
        const logs = await prisma.actionLog.deleteMany();
        console.log(`Deleted ${logs.count} action logs.`);

        console.log('Deleting Grievances...');
        const grievances = await prisma.grievance.deleteMany();
        console.log(`Deleted ${grievances.count} grievances.`);

        console.log('--- Database Cleared Successfully ---');
    } catch (e) {
        console.error('Error clearing database:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
