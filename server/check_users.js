const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    console.log('User count:', users.length);
    console.log('Users:', users.map(u => ({ username: u.username, role: u.role, passwordHash: u.password.substring(0, 10) + '...' })));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
