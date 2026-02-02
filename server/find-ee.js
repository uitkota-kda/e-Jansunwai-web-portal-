const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const users = await prisma.user.findMany({
        where: {
            OR: [
                { username: { contains: 'ee' } },
                { username: { contains: 'crf' } },
                { role: 'EXECUTIVE_ENGINEER' }
            ]
        }
    });
    console.log(JSON.stringify(users, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
