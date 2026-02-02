const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const count = await prisma.user.count();
    console.log('Total users:', count);
}
main().catch(console.error).finally(() => prisma.$disconnect());
