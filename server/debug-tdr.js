const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({
        where: { username: 'tdr_zone1' }
    });
    console.log('User tdr_zone1:', JSON.stringify(user, null, 2));

    const grievances = await prisma.grievance.findMany({
        where: {
            OR: [
                { assignedZone: 'TDR Zone 1' },
                { assignedSection: 'Revenue' }
            ]
        },
        take: 5
    });
    console.log('Grievances assigned to TDR Zone 1 or Revenue:', JSON.stringify(grievances.map(g => ({
        id: g.id,
        grievanceId: g.grievanceId,
        assignedSection: g.assignedSection,
        assignedZone: g.assignedZone,
        subStatus: g.subStatus,
        status: g.status
    })), null, 2));

    // Check what the listGrievances would return for this user
    let whereClause = {};
    if (user.role === 'SECTION_OFFICER') {
        if (user.section) {
            whereClause = { assignedSection: user.section };
        }
    } else if (['EXECUTIVE_ENGINEER', 'REVENUE_OFFICIAL', 'PLANNING_OFFICIAL', 'LEGAL_OFFICIAL', 'FINANCE_OFFICIAL'].includes(user.role)) {
        if (user.zone) {
            whereClause = { assignedZone: user.zone };
        }
    }

    console.log('Backend whereClause for this user:', JSON.stringify(whereClause, null, 2));

    const results = await prisma.grievance.findMany({ where: whereClause });
    console.log('Count from backend logic:', results.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
