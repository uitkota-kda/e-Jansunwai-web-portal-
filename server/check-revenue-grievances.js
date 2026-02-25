const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const grievances = await prisma.grievance.findMany({
        where: {
            assignedSection: 'Revenue'
        },
        orderBy: { updatedAt: 'desc' },
        take: 10
    });

    console.log('Recent Revenue Grievances:');
    console.log(JSON.stringify(grievances.map(g => ({
        grievanceId: g.grievanceId,
        assignedSection: g.assignedSection,
        assignedZone: g.assignedZone,
        status: g.status,
        subStatus: g.subStatus,
        updatedAt: g.updatedAt
    })), null, 2));

    const users = await prisma.user.findMany({
        where: {
            username: { in: ['dc2', 'tdr_zone1'] }
        }
    });
    console.log('Users (dc2, tdr_zone1):', JSON.stringify(users.map(u => ({
        username: u.username,
        role: u.role,
        section: u.section,
        zone: u.zone
    })), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
