const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function main() {
    console.log('--- DEBUGGING GRIEVANCE ASSIGNMENT ---');

    // 1. Check Housing Zone Grievances
    const housingGrievances = await prisma.grievance.findMany({
        where: { assignedZone: 'Housing' }
    });
    console.log(`Grievances with assignedZone "Housing": ${housingGrievances.length}`);

    // 2. Check all "IN_PROGRESS" grievances assigned to engineering
    const engineeringGrievances = await prisma.grievance.findMany({
        where: { assignedSection: 'Director Engineering' }
    });
    console.log(`Total Engineering Grievances: ${engineeringGrievances.length}`);

    // 3. Log all assignment fields for these
    const summary = engineeringGrievances.map(g => ({
        id: g.grievanceId,
        section: g.assignedSection,
        zone: g.assignedZone,
        officer: g.assignedOfficer,
        status: g.status,
        subStatus: g.subStatus
    }));

    fs.writeFileSync('assignment_debug.json', JSON.stringify(summary, null, 2));
    console.log('Summary written to assignment_debug.json');

    // 4. Check Housing User specifically
    const housingUser = await prisma.user.findUnique({
        where: { username: 'ee_housing' }
    });
    console.log('Housing User Zone in DB:', housingUser ? housingUser.zone : 'NOT FOUND');
}

main().catch(console.error).finally(() => prisma.$disconnect());
