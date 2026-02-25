const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const grievances = await prisma.grievance.findMany({
        select: {
            grievanceId: true,
            assignedSection: true,
            assignedZone: true,
            subStatus: true,
            status: true,
            updatedAt: true
        }
    });
    console.log(JSON.stringify(grievances, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
