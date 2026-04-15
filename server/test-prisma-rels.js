const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        console.log('Testing include: { actionlog: true }');
        const g1 = await prisma.grievance.findFirst({
            include: { actionlog: true }
        });
        console.log('SUCCESS with actionlog');
    } catch (e) {
        console.log('FAILED with actionlog:', e.message);
    }

    try {
        console.log('\nTesting include: { logs: true }');
        const g2 = await prisma.grievance.findFirst({
            include: { logs: true }
        });
        console.log('SUCCESS with logs');
    } catch (e) {
        console.log('FAILED with logs:', e.message);
    }

    await prisma.$disconnect();
}

test();
