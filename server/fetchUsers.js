const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        select: {
            username: true,
            role: true,
            section: true,
            zone: true
        }
    });
    console.log(JSON.stringify(users, null, 2));
}

main().catch(err => console.error(err)).finally(() => prisma.$disconnect());
