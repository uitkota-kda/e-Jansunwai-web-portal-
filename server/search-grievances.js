const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const grievances = await prisma.grievance.findMany({
        where: {
            OR: [
                { assignedZone: 'CRF' },
                { assignedOfficer: { contains: 'EE' } },
                { assignedOfficer: { contains: 'CRF' } },
                { description: { contains: 'EE' } }
            ]
        }
    });
    console.log(JSON.stringify(grievances, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
