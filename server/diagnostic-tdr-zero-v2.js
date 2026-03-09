const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const username = 'tdr_zone1';
    const user = await prisma.user.findUnique({ where: { username } });

    console.log('User Profile:', JSON.stringify({
        username: user.username,
        role: user.role,
        section: user.section,
        zone: user.zone
    }, null, 2));

    const grievances = await prisma.grievance.findMany({
        where: { assignedZone: user.zone },
        orderBy: { updatedAt: 'desc' }
    });

    console.log(`Found ${grievances.length} grievances for zone "${user.zone}"`);

    grievances.forEach((g, i) => {
        console.log(`\nGrievance ${i + 1}:`);
        console.log(`  ID: ${g.grievanceId}`);
        console.log(`  assignedZone: "${g.assignedZone}"`);
        console.log(`  assignedSection: "${g.assignedSection}"`);
        console.log(`  subStatus: "${g.subStatus}"`);

        // Filter logic check
        const userZone = (user.zone || '').trim().toLowerCase();
        const grievanceZone = (g.assignedZone || '').trim().toLowerCase();
        const userSection = (user.section || '').trim().toLowerCase();
        const grievanceSection = (g.assignedSection || '').trim().toLowerCase();

        const zoneMatch = userZone && grievanceZone === userZone;
        const sectionMatch = (!userZone && userSection) ? grievanceSection === userSection : false;
        const isAssignedToSub = ['ASSIGNED_TO_SUB', 'ASSIGNED_TO_EE', 'SUB_SUBMITTED', 'SUB_RETURNED'].includes(g.subStatus);

        console.log(`  Matches: zoneMatch=${zoneMatch}, sectionMatch=${sectionMatch}, isAssignedToSub=${isAssignedToSub}`);
        console.log(`  Final Decision: ${(zoneMatch || sectionMatch) && isAssignedToSub}`);
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
