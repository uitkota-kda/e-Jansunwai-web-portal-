const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    const password = 'kda123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const users = [
        { username: 'superadmin', password: hashedPassword, name: 'Master Admin', role: 'SUPER_ADMIN' },
        { username: 'admin', password: hashedPassword, name: 'System Moderator', role: 'MODERATOR' },
        // Officials (Directors & DCs)
        { username: 'dc1', password: hashedPassword, name: 'Deputy Commissioner I', role: 'SECTION_OFFICER', section: 'Deputy commissioner I' },
        { username: 'dc2', password: hashedPassword, name: 'Deputy Commissioner II', role: 'SECTION_OFFICER', section: 'Deputy commissioner II' },
        { username: 'eng', password: hashedPassword, name: 'Director Engineering', role: 'SECTION_OFFICER', section: 'Director Engineering' },
        { username: 'fin', password: hashedPassword, name: 'Director Finance', role: 'SECTION_OFFICER', section: 'Director Finance' },
        { username: 'plan', password: hashedPassword, name: 'Director Planning', role: 'SECTION_OFFICER', section: 'Director Planning' },
        { username: 'legal', password: hashedPassword, name: 'Director Legal', role: 'SECTION_OFFICER', section: 'Director legal' },
        // Revenue Users
        { username: 'tdr_zone1', password: hashedPassword, name: 'TDR Zone 1', role: 'SECTION_OFFICER', section: 'Revenue', zone: 'Zone 1' },
        { username: 'aao_revenue', password: hashedPassword, name: 'AAO Revenue', role: 'SECTION_OFFICER', section: 'Revenue', zone: 'Revenue Desk' },
        // Zone Users (Executive Engineers)
        { username: 'ee_housing', password: hashedPassword, name: 'Ex. En. Housing', role: 'EXECUTIVE_ENGINEER', zone: 'Housing' },
        { username: 'ee_crf', password: hashedPassword, name: 'Ex. En. CRF', role: 'EXECUTIVE_ENGINEER', zone: 'CRF' },

        { username: 'operator', password: hashedPassword, name: 'Data Entry Operator', role: 'OPERATOR' }
    ];

    for (const u of users) {
        await prisma.user.upsert({
            where: { username: u.username },
            update: {
                password: u.password,
                name: u.name,
                role: u.role,
                section: u.section || null
            },
            create: u
        });
    }
    console.log('All Default Users Seeded with hashed passwords');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
