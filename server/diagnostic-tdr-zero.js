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

    // Simulate listGrievances logic for this role
    let whereClause = {};
    if (user.role === 'MODERATOR') {
        whereClause = {};
    } else if (user.role === 'SECTION_OFFICER') {
        if (user.section) {
            whereClause = { assignedSection: user.section };
        }
    } else if (['EXECUTIVE_ENGINEER', 'REVENUE_OFFICIAL', 'PLANNING_OFFICIAL', 'LEGAL_OFFICIAL', 'FINANCE_OFFICIAL'].includes(user.role)) {
        if (user.zone) {
            whereClause = {
                assignedZone: user.zone
            };
        }
    }

    console.log('Backend WhereClause:', JSON.stringify(whereClause, null, 2));

    const grievances = await prisma.grievance.findMany({
        where: whereClause,
        orderBy: { updatedAt: 'desc' }
    });

    console.log(`Found ${grievances.length} total grievances for this filter.`);

    // Simulate Frontend filtering in SubOfficialDashboard.jsx
    const userZone = (user.zone || '').trim().toLowerCase();
    const userSection = (user.section || '').trim().toLowerCase();

    const frontendFiltered = grievances.filter(g => {
        const grievanceZone = (g.assignedZone || '').trim().toLowerCase();
        const grievanceSection = (g.assignedSection || '').trim().toLowerCase();

        const zoneMatch = userZone && grievanceZone === userZone;
        const sectionMatch = (!userZone && userSection) ? grievanceSection === userSection : false;

        const isAssignedToSub = ['ASSIGNED_TO_SUB', 'ASSIGNED_TO_EE', 'SUB_SUBMITTED', 'SUB_RETURNED'].includes(g.subStatus);

        return (zoneMatch || sectionMatch) && isAssignedToSub;
    });

    console.log(`Frontend Filtered Count: ${frontendFiltered.length}`);
    if (frontendFiltered.length > 0) {
        console.log('Samples:', JSON.stringify(frontendFiltered.slice(0, 2).map(g => ({
            grievanceId: g.grievanceId,
            status: g.status,
            subStatus: g.subStatus,
            assignedZone: g.assignedZone,
            assignedSection: g.assignedSection
        })), null, 2));
    }

    // Diagnostics: What if the role is still SECTION_OFFICER?
    if (user.role === 'SECTION_OFFICER') {
        console.log('\nDIAGNOSTIC: User is SECTION_OFFICER. They only see match on assignedSection.');
        console.log('Checking for any Revenue grievances...');
        const revCount = await prisma.grievance.count({ where: { assignedSection: 'Revenue' } });
        console.log('Grievances with assignedSection="Revenue":', revCount);

        console.log('Checking for grievances where assignedZone="TDR Zone 1" but assignedSection is NOT "Revenue"...');
        const missed = await prisma.grievance.count({
            where: {
                assignedZone: 'TDR Zone 1',
                NOT: { assignedSection: 'Revenue' }
            }
        });
        console.log('Count:', missed);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
