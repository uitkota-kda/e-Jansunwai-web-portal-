const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        where: {
            username: {
                in: ['tdr_zone1', 'aao_north', 'dc2']
            }
        }
    });
    console.log(JSON.stringify(users, null, 2));

    const grievances = await prisma.grievance.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
    });
    console.log('Recent 5 Grievances:');
    console.log(JSON.stringify(grievances.map(g => ({
        id: g.id,
        grievanceId: g.grievanceId,
        assignedSection: g.assignedSection,
        assignedZone: g.assignedZone,
        subStatus: g.subStatus
    })), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
