const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();
async function main() {
    const users = await prisma.user.findMany({
        select: { id: true, username: true, role: true, section: true, zone: true }
    });
    fs.writeFileSync('users_dump.json', JSON.stringify(users, null, 2));
    console.log('Users dumped to users_dump.json');
}
main().catch(console.error).finally(() => prisma.$disconnect());
