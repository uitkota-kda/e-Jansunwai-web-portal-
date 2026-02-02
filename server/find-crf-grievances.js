const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const grievances = await prisma.grievance.findMany({
        where: { assignedZone: 'CRF' },
        include: { assignedTo: true }
    });
    console.log(JSON.stringify(grievances, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
