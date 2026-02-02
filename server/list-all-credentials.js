const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const users = await prisma.user.findMany({
        where: { role: 'EXECUTIVE_ENGINEER' },
        select: { username: true, zone: true },
        orderBy: { zone: 'asc' }
    });
    console.log('| Zone Name | Username | Password |');
    console.log('|-----------|----------|----------|');
    users.forEach(u => {
        console.log(`| ${u.zone} | ${u.username} | kda123 |`);
    });
}
main().catch(console.error).finally(() => prisma.$disconnect());
