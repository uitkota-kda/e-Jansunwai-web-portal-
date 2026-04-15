const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const roles = await prisma.user.findMany({ select: { role: true } });
        const uniqueRoles = [...new Set(roles.map(r => r.role))];
        console.log('Unique Roles in DB:', uniqueRoles);

        const moderators = await prisma.user.findMany({ where: { role: 'MODERATOR' } });
        console.log('Moderator Users:', JSON.stringify(moderators.map(m => m.username), null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
