const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({ where: { username: 'tdr_zone1' } });
    if (!user) {
        console.log('User tdr_zone1 NOT FOUND');
        const allUsers = await prisma.user.findMany({ select: { username: true } });
        console.log('Available usernames:', allUsers.map(u => u.username).join(', '));
        return;
    }
    console.log('User found:', JSON.stringify(user, null, 2));
}

main().finally(() => prisma.$disconnect());
