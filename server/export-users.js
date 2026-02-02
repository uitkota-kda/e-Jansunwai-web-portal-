const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
async function main() {
    const users = await prisma.user.findMany();
    fs.writeFileSync('users_output.json', JSON.stringify(users, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
