const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Available models in Prisma client:');
    const models = Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$'));
    console.log(models);

    try {
        const userCount = await prisma.user.count();
        console.log('User model works. Count:', userCount);
    } catch (e) { console.log('User model failed:', e.message); }

    try {
        const grievanceCount = await prisma.grievance.count();
        console.log('Grievance model works. Count:', grievanceCount);
    } catch (e) { console.log('Grievance model failed:', e.message); }

    try {
        const actionlogCount = await prisma.actionlog.count();
        console.log('actionlog model works. Count:', actionlogCount);
    } catch (e) { console.log('actionlog model failed:', e.message); }

    try {
        const actionLogCount = await prisma.actionLog.count();
        console.log('actionLog model works. Count:', actionLogCount);
    } catch (e) { console.log('actionLog model failed:', e.message); }

    await prisma.$disconnect();
}

main();
