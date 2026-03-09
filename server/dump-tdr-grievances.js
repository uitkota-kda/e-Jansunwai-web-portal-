const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const grievances = await prisma.grievance.findMany({
        where: { assignedZone: 'TDR Zone 1' }
    });
    console.log('--- GRIEVANCES FOR TDR Zone 1 ---');
    console.log(JSON.stringify(grievances.map(g => ({
        id: g.grievanceId,
        subStatus: g.subStatus,
        assignedZone: g.assignedZone,
        status: g.status
    })), null, 2));
}

main().finally(() => prisma.$disconnect());
