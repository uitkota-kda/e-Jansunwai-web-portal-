const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    console.log('--- All Grievances ---');
    const grievances = await prisma.grievance.findMany();
    console.log(`Total Count: ${grievances.length}`);
    console.log(JSON.stringify(grievances.map(g => ({
        id: g.grievanceId,
        section: g.assignedSection,
        zone: g.assignedZone,
        status: g.status
    })), null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
