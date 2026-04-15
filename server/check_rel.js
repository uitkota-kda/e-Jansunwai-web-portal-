const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const grievance = await prisma.grievance.findFirst({
            include: { actionlog: true }
        });
        console.log('Relation "actionlog" works.');
    } catch (e) { console.log('Relation "actionlog" failed:', e.message); }

    try {
        const grievance = await prisma.grievance.findFirst({
            include: { logs: true }
        });
        console.log('Relation "logs" works.');
    } catch (e) { console.log('Relation "logs" failed:', e.message); }

    await prisma.$disconnect();
}

main();
