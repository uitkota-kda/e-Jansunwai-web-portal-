const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.findMany({
            select: { username: true, role: true }
        });
        console.log('Users and Roles:', JSON.stringify(users, null, 2));

        const totalGrievances = await prisma.grievance.count();
        console.log('Total Grievances:', totalGrievances);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
