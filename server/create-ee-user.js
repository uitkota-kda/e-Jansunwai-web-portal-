const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function main() {
    const password = 'kda123';
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.upsert({
        where: { username: 'ee_crf' },
        update: {
            role: 'EXECUTIVE_ENGINEER',
            zone: 'CRF',
            name: 'EE CRF'
        },
        create: {
            username: 'ee_crf',
            password: hashedPassword,
            name: 'EE CRF',
            role: 'EXECUTIVE_ENGINEER',
            zone: 'CRF'
        }
    });
    console.log('User created:', user.username);
}
main().catch(console.error).finally(() => prisma.$disconnect());
