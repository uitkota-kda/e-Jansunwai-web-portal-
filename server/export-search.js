const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
async function main() {
    const grievances = await prisma.grievance.findMany({
        where: {
            OR: [
                { assignedZone: 'CRF' },
                { assignedOfficer: { contains: 'EE' } }
            ]
        }
    });
    fs.writeFileSync('grievances_output.json', JSON.stringify(grievances, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
