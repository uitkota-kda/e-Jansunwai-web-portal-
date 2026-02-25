const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- USER CHECK ---');
    const user = await prisma.user.findUnique({
        where: { username: 'tdr_zone1' }
    });
    console.log('User tdr_zone1:', JSON.stringify(user, null, 2));

    console.log('\n--- GRIEVANCE CHECK ---');
    // Find any grievance that has assignedZone: 'TDR Zone 1'
    const grievances = await prisma.grievance.findMany({
        where: {
            assignedZone: 'TDR Zone 1'
        }
    });

    console.log(`Found ${grievances.length} grievances assigned to 'TDR Zone 1'`);
    console.log(JSON.stringify(grievances.map(g => ({
        id: g.id,
        grievanceId: g.grievanceId,
        assignedSection: g.assignedSection,
        assignedZone: g.assignedZone,
        status: g.status,
        subStatus: g.subStatus
    })), null, 2));

    console.log('\n--- BACKEND LOGIC SIMULATION ---');
    let whereClause = {};
    if (user.role === 'SECTION_OFFICER') {
        whereClause = { assignedSection: user.section };
    } else if (['REVENUE_OFFICIAL', 'PLANNING_OFFICIAL', 'EXECUTIVE_ENGINEER'].includes(user.role)) {
        whereClause = { assignedZone: user.zone };
    }

    console.log('Simulated whereClause:', JSON.stringify(whereClause, null, 2));
    const results = await prisma.grievance.findMany({ where: whereClause });
    console.log('Results count:', results.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
